import {
  ExecutionContext,
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    const { authorization } = request.headers;
    if (!authorization) {
      throw new BadRequestException({
        message: '토큰이 없습니다.',
      });
    }

    const token = authorization.replace('Bearer ', '');
    const tokenValidate = await this.validate(token);
    request.user = tokenValidate.user ? tokenValidate.user : tokenValidate;
    return true;
  }

  async validate(token: string) {
    try {
      // 토큰 검증
      const tokenVerify = await this.authService.tokenValidate(token);
      if (tokenVerify.type === 'accessToken') {
        return await this.userService.getOne(tokenVerify.id);
      } else {
        return tokenVerify;
      }
    } catch (error) {
      switch (error.message) {
        case 'invalid token':
          throw new BadRequestException({
            message: '유효하지 않은 토큰입니다.',
          });

        case 'invalid signature':
          throw new BadRequestException({
            message: '유효하지 않은 토큰입니다.',
          });

        case 'jwt expired':
          throw new BadRequestException({
            message: '토큰이 만료되었습니다.',
          });

        default:
          throw new HttpException(
            {
              message: '서버 내부 오류.',
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}
