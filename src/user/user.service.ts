import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { ApiResponse } from 'src/types/global';
import { Repository } from 'typeorm';
import { Feed } from '../feed/entities/feed.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Feed)
    private feedsRepository: Repository<Feed>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async doSocialLogin(
    platfrom: string,
    socialToken: string,
  ): Promise<
    ApiResponse<{
      isNewUser: boolean;
      accessToken?: string;
    }>
  > {
    let socialId: string;

    if (platfrom === 'KAKAO') {
      const kakaoUrl = this.configService.get('KAKAO_ME_URI');
      const data = await firstValueFrom(
        this.httpService.get(kakaoUrl, {
          headers: { Authorization: `Bearer ${socialToken}` },
        }),
      )
        .then((res) => res.data)
        .catch(() => {
          throw new UnauthorizedException({
            message: '소셜 로그인 실패',
          });
        });
      socialId = `KAKAO@${data.id}`;
    }

    return {
      message: '소셜 로그인 성공',
      data: {
        isNewUser: true,
      },
    };
  }

  async getOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (user === null) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  async getUserByNickname(
    nickname: string,
  ): Promise<ApiResponse<{ available: boolean }>> {
    const user = await this.usersRepository.findOneBy({ nickname });
    let available;

    if (user) {
      available = false;
    } else {
      available = true;
    }

    return {
      message: '닉네임 중복 조회 성공',
      data: { available },
    };
  }

  async getMyFeeds(): Promise<
    ApiResponse<{
      nickname: string;
      count: number;
      feeds: Feed[];
    }>
  > {
    // @FIXME: Get user by parsing access-token
    const userId = 1;
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException({
        message: '목록 조회 실패. 유효하지 않은 토큰입니다.',
      });
    }
    const feeds = await this.feedsRepository.find({
      where: { user: { id: user.id }, isDeleted: false },
    });
    return {
      message: '목록 조회 성공',
      data: {
        nickname: user.nickname,
        count: feeds.length,
        feeds,
      },
    };
  }

  async updateNickname(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse> {
    const user = this.getOne(userId);
    await this.usersRepository.update(userId, { ...user, ...updateUserDto });

    return {
      message: '닉네임 수정 완료',
    };
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    const user = await this.usersRepository.findOneBy({
      id: userId,
      isDeleted: false,
    });
    if (!user) {
      throw new NotFoundException({
        message: '존재하지 않는 회원입니다.',
      });
    }
    await this.usersRepository.update(userId, { isDeleted: true });

    return {
      message: '회원 탈퇴 성공',
    };
  }
}
