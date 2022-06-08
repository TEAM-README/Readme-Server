import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { responseMessage } from 'src/response-message';
import { PlatformEnum } from 'src/types/platform.enum';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PlatformEnum, { message: responseMessage.INCORRECT_PLATFORM })
  @ApiProperty({
    description: '소셜 플랫폼 종류',
    enum: PlatformEnum,
  })
  platform: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 토큰',
    default: 'socialToken',
  })
  socialToken: string;
}
