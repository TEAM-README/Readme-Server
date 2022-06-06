import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @HttpCode(200)
  @Post('/login')
  socialLogin(
    @Body('platform') platform: string,
    @Body('socialToken') socialToken: string,
  ) {
    return this.userService.socialLogin(platform, socialToken);
  }

  @Post('auth/access-token')
  createAceessToken(@Body('nickname') nickname: string) {
    return this.authService.createAccessToken(nickname);
  }

  @Get('/nickname')
  getUserByNickname(@Query('query') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/myFeeds')
  getOne(@Req() req) {
    return this.userService.getMyFeeds(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Req() req) {
    return this.userService.deleteUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('/nickname')
  updateNickname(@Req() req, @Body() updateData: UpdateUserDto) {
    return this.userService.updateNickname(req.user.id, updateData);
  }
}
