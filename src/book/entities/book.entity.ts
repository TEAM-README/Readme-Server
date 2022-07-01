import { Exclude } from 'class-transformer';
import { Feed } from 'src/feed/entities/feed.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryColumn()
  isbn: string;

  @Column()
  subIsbn: string;

  @Column()
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
