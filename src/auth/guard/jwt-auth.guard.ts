import {
  ExecutionContext,
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { responseMessage } from 'src/constants/response-message';
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
        message: responseMessage.TOKEN_EMPTY,
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
          throw new HttpException(
            {
              message: responseMessage.TOKEN_INVALID,
            },
            HttpStatus.UNAUTHORIZED,
          );

        case 'invalid signature':
          throw new HttpException(
            {
              message: responseMessage.TOKEN_INVALID,
            },
            HttpStatus.UNAUTHORIZED,
          );

        case 'jwt expired':
          throw new HttpException(
            {
              message: responseMessage.TOKEN_EXPIRED,
            },
            HttpStatus.UNAUTHORIZED,
          );

        default:
          throw new HttpException(
            {
              message: responseMessage.VERIFY_TOKEN_FAIL,
            },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
      }
    }
  }
}
