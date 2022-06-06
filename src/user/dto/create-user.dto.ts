import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 플랫폼 종류',
    default: 'KAKAO or APPLE or NAVER',
  })
  platform: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '소셜 토큰',
    default: 'socialToken',
  })
  socialToken: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '닉네임',
    default: 'nickname',
  })
  nickname: string;
}
