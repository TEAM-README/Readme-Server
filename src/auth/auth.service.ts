import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { responseMessage } from 'src/response-message';
import { ApiResponse } from 'src/types/global';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createAccessToken(
    nickname: string,
  ): Promise<ApiResponse<{ accessToken: string }>> {
    const user = await this.usersRepository.findOneBy({ nickname });

    if (user) {
      const payload = {
        type: 'accessToken',
        id: user.id,
        nickname: nickname,
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: responseMessage.CREATE_TOKEN_SUCCESS,
        data: {
          accessToken: accessToken,
        },
      };
    } else {
      throw new UnauthorizedException({
        message: responseMessage.NO_USER,
      });
    }
  }

  async tokenValidate(token: string) {
    return await this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
