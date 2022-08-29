import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBookDto {
  @IsString()
  isbn: string;

  @IsString()
  subIsbn: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  image: string;
}
