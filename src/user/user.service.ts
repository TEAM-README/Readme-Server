import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiResponse } from 'src/types/global';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  async getUserByNickname(
    nickname: string,
  ): Promise<ApiResponse<{ available: boolean }>> {
    const user = await this.usersRepository.findOneBy({ nickname });
    let available;

    if (user) {
      available = false;
    } else {
      available = true;
    }

    return {
      message: '닉네임 중복 조회 성공',
      data: { available },
    };
  }

  async getOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });

    if (user === null) {
      throw new NotFoundException('user not found');
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateNickname(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse> {
    const user = this.getOne(userId);
    await this.usersRepository.update(userId, { ...user, ...updateUserDto });

    return {
      message: '닉네임 수정 완료',
    };
  }
}
