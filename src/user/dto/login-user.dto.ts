import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PlatformEnum } from 'src/types/platform.enum';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(PlatformEnum, { message: '올바르지 않은 소셜 플랫폼' })
  @ApiProperty({
    description: '소셜 플랫폼 종류',
    enum: PlatformEnum,
  })
  platform: PlatformEnum;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 토큰',
    default: 'socialToken',
  })
  socialToken: string;
}
