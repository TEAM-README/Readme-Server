import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsString } from 'class-validator';
import { User } from '../../user/entities/user.entity';

export class CreateFeedDto {
  @IsString()
  @ApiProperty({
    description: '카테고리 이름',
    default: '소설',
  })
  categoryName: string;

  @IsString()
  @ApiProperty({
    description: '인상 깊은 문장',
    default:
      '뜨거운 물에는 빨리 녹고 찬물에는 좀 천천히 녹겠지만 녹아 사라진다는 점에서는 다를게 없었다. 나는 따뜻한 물에 녹고 싶다. 오랫동안 너무 춥게만 살지 않았는가. 눈사람은 온수를 틀고 자신의 몸이 점점 녹아 물이 되는 것을 지켜보다 잠이 들었다.',
  })
  sentence: string;

  @IsString()
  @ApiProperty({
    description: '느낀점',
    default:
      '전체를 꼭..읽어보시길 바랍니다👀 몇 번 봐도 질리지 않는 것 같아요 저는ㅠㅠ 어떻게 저런 창의력이...',
  })
  feeling: string;

  @IsNumber()
  @ApiProperty({
    description: '도서 고유 번호',
    default: 1234,
  })
  isbn: number;

  @IsNumber()
  @ApiProperty({
    description: '서브 도서 고유 번호',
    default: 56789,
  })
  subIsbn: number;

  @IsString()
  @ApiProperty({
    description: '도서 제목',
    default: '눈사람 자살사건',
  })
  title: string;

  @IsString()
  @ApiProperty({
    description: '저자',
    default: 'NUNU',
  })
  author: string;

  @IsString()
  @ApiProperty({
    description: '썸네일 이미지 url',
    default: 'image',
  })
  image: string;

  @IsObject()
  @ApiProperty({
    description: '사용자 정보',
    default: {
      id: 1,
      uid: 'kakao@1234',
      nickname: '갓영권',
      refreshToken: 'temporary_token',
      createdAt: '2022-05-12T22:12:35.253Z',
      updatedAt: '2022-05-14T01:11:45.480Z',
      isDeleted: false,
    },
  })
  user: User;
}
