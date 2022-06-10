import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feed } from './entities/feed.entity';
import { Book } from '../book/entities/book.entity';
import { User } from '../user/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feed, Book, User]),
    AuthModule,
    UserModule,
  ],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
