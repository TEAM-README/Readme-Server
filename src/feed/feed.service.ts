import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Book } from '../book/entities/book.entity';
import { ApiResponse } from '../types/global';
import { User } from '../user/entities/user.entity';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(
    createFeedDto: CreateFeedDto,
  ): Promise<ApiResponse<{ id: number; createdAt: Date; updatedAt: Date }>> {
    try {
      await this.booksRepository.save(createFeedDto);
      const { id, createdAt, updatedAt } = await this.feedsRepository.save(
        createFeedDto,
      );
      return {
        message: '피드 추가 성공',
        data: { id, createdAt, updatedAt },
      };
    } catch (e) {
      console.error(e);
    }
  }

  async findAll(filters: string): Promise<ApiResponse<Feed[]>> {
    const filterArr = filters.split(',');

    const feeds = await this.feedsRepository.find({
      where: { isDeleted: false, categoryName: In(filterArr) },
    });

    return {
      message: '피드 목록 조회 성공',
      data: feeds,
    };
  }

  async findOne(feedId: string) {
    if (!+feedId) {
      throw new HttpException(
        {
          message: '피드 상세 조회 실패. feedId 값을 확인하세요.',
          data: feedId,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const feed = await this.feedsRepository.findOneBy({ id: +feedId });
    if (!feed || feed.isDeleted) {
      throw new HttpException(
        {
          message: '피드 상세 조회 실패. 피드가 없습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const book = await this.booksRepository.findOneBy({ isbn: feed.isbn });
    if (!book || book.isDeleted) {
      throw new HttpException(
        {
          message: '피드 상세 조회 실패. 책 정보가 없습니다.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const { author, image } = book;

    return {
      message: '피드 상세 조회 성공',
      data: {
        ...feed,
        author,
        image,
      },
    };
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
      isDeleted: true,
    });
    return {
      message: '피드 삭제 성공',
    };
  }
}
