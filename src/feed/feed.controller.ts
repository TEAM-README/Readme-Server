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
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiBearerAuth('accessToken')
@UseGuards(JwtAuthGuard)
@Controller('feed')
@ApiTags('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Post()
  create(@Req() req, @Body() createFeedDto: CreateFeedDto) {
    return this.feedService.create(req.user, createFeedDto);
  }

  @Get()
  @ApiQuery({ name: 'filters', description: '분류 카테고리' })
  findAll(@Query('filters') filters: string) {
    return this.feedService.findAll(filters);
  }

  @Get(':feedId')
  findOne(@Param('feedId') feedId: string) {
    return this.feedService.findOne(feedId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeedDto: UpdateFeedDto) {
    return this.feedService.update(+id, updateFeedDto);
  }

  @Delete(':feedId')
  remove(@Param('feedId') feedId: string) {
    return this.feedService.remove(feedId);
  }
}
