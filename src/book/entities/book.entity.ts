import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Book {
  @PrimaryColumn()
  @Exclude()
  isbn: number;

  @Column({ nullable: true })
  @Exclude()
  subIsbn: number;

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
}
