import { IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  id: number;
  @IsString()
  uid: string;
  @IsString()
  nickname: string;
  @IsString()
  refresh_token: string;
}
