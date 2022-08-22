import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Book } from 'src/book/entities/book.entity';
import { CreateBookDto } from 'src/book/dto/create-book.dto';

export class CreateFeedDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '카테고리 이름',
    default: '소설',
  })
  categoryName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '인상 깊은 문장',
    default:
      '뜨거운 물에는 빨리 녹고 찬물에는 좀 천천히 녹겠지만 녹아 사라진다는 점에서는 다를게 없었다. 나는 따뜻한 물에 녹고 싶다. 오랫동안 너무 춥게만 살지 않았는가. 눈사람은 온수를 틀고 자신의 몸이 점점 녹아 물이 되는 것을 지켜보다 잠이 들었다.',
  })
  sentence: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '느낀점',
    default:
      '전체를 꼭..읽어보시길 바랍니다👀 몇 번 봐도 질리지 않는 것 같아요 저는ㅠㅠ 어떻게 저런 창의력이...',
  })
  feeling: string;

  @IsNotEmpty()
  @IsObject()
  @Type(() => CreateBookDto)
  @ApiProperty({
    type: Book,
    default: {
      isbn: '1234',
      subIsbn: '56789',
      title: '눈사람 자살사건',
      author: 'NUNU',
      image: 'image',
    },
  })
  book: Book;
}
