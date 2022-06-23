import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Feed } from '../../feed/entities/feed.entity';

@Entity()
export class Book {
  @PrimaryColumn()
  @Exclude()
  isbn: string;

  @Column()
  @Exclude()
  subIsbn: string;

  @Column()
  @Exclude()
  title: string;

  @Column()
  author: string;

  @Column()
  image: string;

  @CreateDateColumn()
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @Column({ default: false })
  @Exclude()
  isDeleted: boolean;

  @OneToMany(() => Feed, (feed) => feed.book)
  feeds: Feed[];
}
