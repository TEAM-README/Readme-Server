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
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('/nickname')
  getUserByNickname(@Query('query') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @Get('/myFeeds')
  getOne() {
    return this.userService.getMyFeeds();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  @Patch('/nickname')
  updateNickname(@Body() updateData: UpdateUserDto) {
    // @FIXME: Get user by parsing access-token
    const userId = 1;

    return this.userService.updateNickname(userId, updateData);
  }
}
