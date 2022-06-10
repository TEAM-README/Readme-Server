import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { LoginUserDto } from './dto/login-user.dto';

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
  socialLogin(@Body() loginUserDto: LoginUserDto) {
    return this.userService.socialLogin(loginUserDto);
  }

  @ApiOperation({ summary: '토큰 발급용 임시 url' })
  @ApiQuery({ name: 'nickname', description: '유저 닉네임' })
  @Post('auth/access-token')
  createAceessToken(@Query('nickname') nickname: string) {
    return this.authService.createAccessToken(nickname);
  }

  @Get('/nickname')
  getUserByNickname(@Query('query') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @Get('/myFeeds')
  getOne(@Req() req) {
    return this.userService.getMyFeeds(req.user.id);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @Delete()
  remove(@Req() req) {
    return this.userService.deleteUser(req.user.id);
  }

  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  @Patch('/nickname')
  updateNickname(@Req() req, @Body() updateData: UpdateUserDto) {
    return this.userService.updateNickname(req.user.id, updateData);
  }
}
