import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { ApiResponse } from 'src/types/global';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  getAll() {
    return this.userService.findAll();
  }

  @Get('/nickname')
  getUserByNickname(@Query('query') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.userService.getOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch('/nickname')
  updateNickname(@Body() updateData: UpdateUserDto) {
    // @FIXME: Get user by parsing access-token
    const userId = 1;

    this.userService.updateNickname(userId, updateData);

    return {
      succes: true,
      message: '닉네임 수정 완료',
    };
  }
}
