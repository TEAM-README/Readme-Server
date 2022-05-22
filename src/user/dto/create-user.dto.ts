import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @ApiProperty({
    description: '소셜 로그인 uid',
    default: 'kakao@1234',
  })
  uid: string;

  @IsString()
  @ApiProperty({
    description: '사용자 닉네임',
    default: 'nickname1234',
  })
  nickname: string;

  @IsString()
  @ApiProperty({
    description: '리프레시 토큰',
    default: 'temporary_token',
  })
  refreshToken: string;
}
