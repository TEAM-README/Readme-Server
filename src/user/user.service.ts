import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
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
import jwtDecode, { JwtHeader } from 'jwt-decode';
import * as jwksRsa from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { AppleAuthKeysResponse } from 'src/types/apple-auth-keys-response.type';
import { AppleJwtPayload } from 'src/types/apple-jwt-payload.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Feed)
    private feedsRepository: Repository<Feed>,
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
      uid = await this.getAppleUid(socialToken);
    } else {
      uid = await this.getNaverUid(socialToken);
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
      nickname?: string;
      accessToken?: string;
    }>
  > {
    const { platform, socialToken }: { platform: string; socialToken: string } =
      loginUserDto;
    let uid: string;

    if (platform === PlatformEnum.KAKAO) {
      uid = await this.getKakaoUid(socialToken);
    } else if (platform === PlatformEnum.APPLE) {
      uid = await this.getAppleUid(socialToken);
    } else {
      uid = await this.getNaverUid(socialToken);
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
        nickname: user.nickname,
        accessToken,
      },
    };
  }

  async getKakaoUid(socialToken: string): Promise<string> {
    const kakaoUrl = 'https://kapi.kakao.com/v2/user/me';
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

  async getAppleUid(identityToken: string): Promise<string> {
    // Decode the header of the identity token
    const header: JwtHeader & { kid: string } = jwtDecode<
      JwtHeader & { kid: string }
    >(identityToken, {
      header: true,
    });
    // Get kid value from decoded header
    const kid: string = header.kid;

    // Check if there is a key set matching kid in the public key obtained from apple
    const appleAuthKeysResponse: AppleAuthKeysResponse =
      await this.getAppleAuthKeys();
    // Find and save the shared kid
    const sharedKid: string = appleAuthKeysResponse.keys.filter(
      (x) => x['kid'] === kid,
    )[0]?.['kid'];

    // Get public JWKS from Apple
    const client: jwksRsa.JwksClient = jwksRsa({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });
    let publicKey = '';
    try {
      // Get signing key from the shared key
      const signingKey: jwksRsa.CertSigningKey | jwksRsa.RsaSigningKey =
        await client.getSigningKey(sharedKid);
      // Extract public key from singing key
      publicKey = signingKey.getPublicKey();
    } catch (error) {
      throw new HttpException(
        {
          message: responseMessage.APPLE_GET_SIGNING_KEY_FAIL,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    if (!publicKey) {
      throw new HttpException(
        {
          message: responseMessage.APPLE_GET_PUBLIC_KEY_FAIL,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    try {
      // Verify identity token using public key
      const payload: AppleJwtPayload = <AppleJwtPayload>(
        jwt.verify(identityToken, publicKey)
      );
      if (payload.iss !== 'https://appleid.apple.com') {
        throw new HttpException(
          {
            message: responseMessage.TOKEN_INVALID,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else if (payload.aud !== this.configService.get('APPLE_SECRET')) {
        throw new HttpException(
          {
            message: responseMessage.TOKEN_INVALID,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      return `APPLE@${payload.sub}`;
    } catch (error) {
      throw new HttpException(
        {
          message: responseMessage.TOKEN_INVALID,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getAppleAuthKeys(): Promise<AppleAuthKeysResponse> {
    try {
      const result = await firstValueFrom(
        this.httpService.get('https://appleid.apple.com/auth/keys'),
      );
      return result.data;
    } catch (error) {
      throw new HttpException(
        {
          message: responseMessage.APPLE_GET_PUBLIC_KEY_FAIL,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async getNaverUid(socialToken: string): Promise<string> {
    const naverUrl = 'https://openapi.naver.com/v1/nid/me';
    try {
      const result = await firstValueFrom(
        this.httpService.get(naverUrl, {
          headers: { Authorization: `Bearer ${socialToken}` },
        }),
      );
      return `NAVER@${result.data.response.id}`;
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
      order: { createdAt: 'DESC' },
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
