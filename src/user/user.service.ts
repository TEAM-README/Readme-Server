import {
  HttpException,
  HttpStatus,
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
import { PlatformEnum } from 'src/types/platform.enum';
import { LoginUserDto } from './dto/login-user.dto';
import { responseMessage } from 'src/constants/response-message';

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

    if (platform === PlatformEnum.KAKAO) {
      uid = await this.getKakaoUid(socialToken);
    } else if (platform === PlatformEnum.APPLE) {
      // @TODO:
      // APPLE LOGIN IMPLEMENTATION
    } else {
      // @TODO:
      // NAVER LOGIN IMPLEMENTATION
    }

    const existingUser = await this.usersRepository.findOneBy({ nickname });
    if (existingUser) {
      throw new HttpException(
        { message: responseMessage.DUPLICATE_NICKNAME },
        HttpStatus.CONFLICT,
      );
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
      message: responseMessage.CREATE_USER,
      data: { accessToken },
    };
  }

  async socialLogin(loginUserDto: LoginUserDto): Promise<
    ApiResponse<{
      isNewUser: boolean;
      accessToken?: string;
    }>
  > {
    const { platform, socialToken }: { platform: string; socialToken: string } =
      loginUserDto;
    let uid: string;

    if (platform === PlatformEnum.KAKAO) {
      uid = await this.getKakaoUid(socialToken);
    } else if (platform === PlatformEnum.APPLE) {
      // @TODO:
      // APPLE LOGIN IMPLEMENTATION
    } else {
      // @TODO:
      // NAVER LOGIN IMPLEMENTATION
    }

    const user = await this.usersRepository.findOneBy({ uid });
    // new signing up user
    if (!user) {
      return {
        message: responseMessage.NEW_USER,
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
      message: responseMessage.SOCIAL_LOGIN_SUCCESS,
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
        message: responseMessage.SOCIAL_LOGIN_FAIL,
      });
    }
  }

  async getOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (user === null) {
      throw new NotFoundException({
        message: responseMessage.NO_USER,
      });
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
      message: responseMessage.READ_NICKNAME_SUCCESS,
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
        message: responseMessage.NO_USER,
      });
    }
    const feeds = await this.feedsRepository.find({
      where: { user: { id: user.id }, isDeleted: false },
    });
    return {
      message: responseMessage.READ_ALL_FEEDS_SUCCESS,
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
      message: responseMessage.UPDATE_NICKNAME_SUCCESS,
    };
  }

  async deleteUser(userId: number): Promise<ApiResponse> {
    const user = await this.usersRepository.findOneBy({
      id: userId,
      isDeleted: false,
    });
    if (!user) {
      throw new NotFoundException({
        message: responseMessage.NO_USER,
      });
    }
    await this.usersRepository.update(userId, { isDeleted: true });

    return {
      message: responseMessage.DELETE_USER,
    };
  }
}
