import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { LoginUserDto } from './login-user.dto';

export class CreateUserDto extends LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: '닉네임',
    default: 'nickname',
  })
  nickname: string;
}
