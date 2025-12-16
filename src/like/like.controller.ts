import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LikeService } from './like.service';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { User } from 'src/auth/user.entity';

@Controller('likes')
@UseGuards(AuthGuard())
export class LikeController {
  constructor(private likeService: LikeService) {}

  @Get('/')
  async getMyLikePosts(@Query('page') page: number, @GetUser() user: User) {
    return this.likeService.getMyLikePosts(page, user);
  }

  @Post('/:postId')
  toggleLike(
    @Param('postId', ParseIntPipe) postId: number,
    @GetUser() user: User,
  ) {
    return this.likeService.toggleLike(postId, user);
  }
}
