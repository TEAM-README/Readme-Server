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
      let existingBook;
      if (!createFeedDto.book.isbn) {
        // 도서의 ISBN이 존재하지 않는 경우
        if (!createFeedDto.book.author) {
          // 도서의 저자 정보도 존재하지 않는 경우 : 중복 확인 불가. 랜덤 숫자를 사용한 FakeISBN으로 새로운 도서 생성
          createFeedDto.book.isbn =
            Math.floor(Math.random() * 10000000000).toString() + 'F';
        } else {
          // 도서의 저자 정보는 존재하는 경우 : 제목, 저자로 중복 확인. 이미 존재하는 책일 경우, DB에 저장된 FakeISBN 그대로 사용
          existingBook = await this.booksRepository.findOneBy({
            title: createFeedDto.book.title,
            author: createFeedDto.book.author,
          });
        }
      } else {
        // 도서의 ISBN이 존재하는 경우
        existingBook = await this.booksRepository.findOneBy({
          isbn: createFeedDto.book.isbn,
        });
      }

      if (existingBook) {
        // 이미 존재하는 도서일 경우, ISBN key값 검사로 book 중복 생성 자동으로 막힘. 존재하지 않는 도서일 경우 기존 createDto대로 새로운 book 생성
        createFeedDto.book = existingBook;
      }

      // 예외 처리 이후 book, feed 생성
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

  async findRecentBook(user: User): Promise<ApiResponse<{ books: Book[] }>> {
    const theUser = {
      id: user.id,
    };
    const myFeeds = await this.feedsRepository.find({
      where: { isDeleted: false, user: theUser },
      order: { createdAt: 'DESC' },
    });
    const duplicatedBooks = myFeeds.map((row) => row.book);
    const books = [...new Set(duplicatedBooks)];
    return {
      message: responseMessage.READ_RECENT_BOOKS_SUCCESS,
      data: {
        books: books,
      },
    };
  }
}
