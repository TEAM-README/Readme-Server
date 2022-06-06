import {
  BadRequestException,
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
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Feed)
    private feedsRepository: Repository<Feed>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const {
      platform,
      socialToken,
      nickname,
    }: { platform: string; socialToken: string; nickname: string } =
      createUserDto;
    let uid: string;

    if (platform === 'KAKAO') {
      uid = await this.getKakaoUid(socialToken);
    } else if (platform === 'APPLE') {
      // @TODO:
      // APPLE LOGIN IMPLEMENTATION
    } else {
      throw new BadRequestException({
        message: '올바르지 않은 소셜 플랫폼',
      });
    }

    const user = {
      uid,
      nickname,
    };

    await this.usersRepository.save(user);

    const accessTokenResponse = await this.authService.createAccessToken(
      nickname,
    );

    const accessToken = accessTokenResponse.data.accessToken;

    return {
      message: '회원가입 성공',
      data: { accessToken },
    };
  }

  async socialLogin(
    platform: string,
    socialToken: string,
  ): Promise<
    ApiResponse<{
      isNewUser: boolean;
      accessToken?: string;
    }>
  > {
    let uid: string;

    if (platform === 'KAKAO') {
      uid = await this.getKakaoUid(socialToken);
    } else if (platform === 'APPLE') {
      // @TODO:
      // APPLE LOGIN IMPLEMENTATION
    } else {
      throw new BadRequestException({
        message: '올바르지 않은 소셜 플랫폼',
      });
    }

    const user = await this.usersRepository.findOneBy({ uid });
    // new signing up user
    if (!user) {
      return {
        message: '신규 사용자입니다',
        data: {
          isNewUser: true,
        },
      };
    }

    const accessTokenResponse = await this.authService.createAccessToken(
      user.nickname,
    );

    const accessToken = accessTokenResponse.data.accessToken;

    return {
      message: '소셜 로그인 성공',
      data: {
        isNewUser: false,
        accessToken,
      },
    };
  }

  async getKakaoUid(socialToken: string): Promise<string> {
    const kakaoUrl = this.configService.get('KAKAO_ME_URI');
    try {
      const result = await firstValueFrom(
        this.httpService.get(kakaoUrl, {
          headers: { Authorization: `Bearer ${socialToken}` },
        }),
      );
      return `KAKAO@${result.data.id}`;
    } catch (error) {
      throw new UnauthorizedException({
        message: '소셜 로그인 실패',
      });
    }
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

  async getMyFeeds(userId: number): Promise<
    ApiResponse<{
      nickname: string;
      count: number;
      feeds: Feed[];
    }>
  > {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException({
        message: '목록 조회 실패. 존재하지 않는 유저입니다.',
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
