import { User } from './../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Book } from '../../book/entities/book.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Feed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoryName: string;

  @ManyToOne(() => Book, (book) => book.isbn, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'isbn' })
  book: Book;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  sentence: string;

  @Column()
  feeling: string;

  @Column({
    default: 0,
  })
  reportedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  @Exclude()
  updatedAt: Date;

  @Column({ default: false })
  isDeleted: boolean;
}
