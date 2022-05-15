import { Injectable } from '@nestjs/common';
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

  remove(id: number) {
    return `This action removes a #${id} feed`;
  }
}
