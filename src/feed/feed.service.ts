import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../book/entities/book.entity';
import { ApiResponse } from '../types/global';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { Feed } from './entities/feed.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed)
    private feedsRepository: Repository<Feed>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) {}
  async create(
    createFeedDto: CreateFeedDto,
  ): Promise<ApiResponse<{ id: number; createdAt: Date; updatedAt: Date }>> {
    try {
      await this.booksRepository.save(createFeedDto);
      const {
        id,
        created_at: createdAt,
        updated_at: updatedAt,
      } = await this.feedsRepository.save(createFeedDto);
      return {
        message: '피드 추가 성공',
        data: { id, createdAt, updatedAt },
      };
    } catch (e) {
      console.error(e);
    }
  }

  findAll() {
    return `This action returns all feed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} feed`;
  }

  update(id: number, updateFeedDto: UpdateFeedDto) {
    return `This action updates a #${id} feed`;
  }

  async remove(feedId: string): Promise<ApiResponse> {
    if (!+feedId) {
      throw new HttpException(
        {
          message: '피드 삭제 실패. feedId 값을 확인하세요.',
          data: feedId,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const feed = await this.feedsRepository.findOneBy({ id: +feedId });
    if (!feed) {
      throw new HttpException(
        {
          message: '피드 삭제 실패. 피드가 없습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.feedsRepository.save({
      ...feed,
      is_deleted: true,
    });
    return {
      message: '피드 삭제 성공',
    };
  }
}
