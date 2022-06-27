import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { responseMessage } from 'src/constants/response-message';
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
    user: User,
    createFeedDto: CreateFeedDto,
  ): Promise<ApiResponse<{ id: number; createdAt: Date }>> {
    try {
      await this.booksRepository.save(createFeedDto.book);

      const { id, createdAt } = await this.feedsRepository.save({
        ...createFeedDto,
        user,
      });

      return {
        message: responseMessage.CREATE_ONE_FEED_SUCCESS,
        data: { id, createdAt },
      };
    } catch (e) {
      console.error(e);
    }
  }

  async findAll(
    filters: string,
  ): Promise<ApiResponse<{ filters: string[]; feeds: Feed[] }>> {
    let filterArr: string[];
    let feeds: Feed[];

    if (!filters) {
      filterArr = [''];
      feeds = await this.feedsRepository.find({
        where: { isDeleted: false },
        order: { createdAt: 'DESC' },
      });
    } else {
      filterArr = filters.split(',');
      feeds = await this.feedsRepository.find({
        where: { isDeleted: false, categoryName: In(filterArr) },
        order: { createdAt: 'DESC' },
      });
    }

    return {
      message: responseMessage.READ_ALL_FEEDS_SUCCESS,
      data: {
        filters: filterArr,
        feeds: feeds,
      },
    };
  }

  async findOne(feedId: string): Promise<ApiResponse<{ feed: Feed }>> {
    if (!+feedId) {
      throw new HttpException(
        {
          message: responseMessage.INCORRECT_FEED_ID,
          data: feedId,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const feed = await this.feedsRepository.findOneBy({ id: +feedId });
    if (!feed || feed.isDeleted) {
      throw new HttpException(
        {
          message: responseMessage.NO_FEED,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: responseMessage.READ_ONE_FEED_SUCCESS,
      data: {
        feed,
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
          message: responseMessage.INCORRECT_FEED_ID,
          data: feedId,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    const feed = await this.feedsRepository.findOneBy({ id: +feedId });
    if (!feed) {
      throw new HttpException(
        {
          message: responseMessage.NO_FEED,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    await this.feedsRepository.save({
      ...feed,
      isDeleted: true,
    });
    return {
      message: responseMessage.DELETE_ONE_FEED_SUCCESS,
    };
  }
}
