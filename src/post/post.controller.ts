import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostController {
  constructor(private postService: PostService) {}
  @Get('/')
  getPosts(@Query('page') page: number) {
    return this.postService.getPosts(page);
  }

  @Get('/my')
  @UseGuards(AuthGuard())
  getMyPosts(@Query('page') page: number, @GetUser() user: User) {
    return this.postService.getMyPosts(page, user);
  }

  @Get('/user/:id')
  @UseGuards(AuthGuard())
  getPostsByUserId(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page: number,
  ) {
    return this.postService.getPostsByUserId(page, id);
  }

  @Get('/search')
  searchPostsByTitle(
    @Query('query') query: string,
    @Query('page') page: number,
  ) {
    return this.postService.searchPostsByTitle(query, page);
  }

  @Get('/:id')
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.postService.getPostById(id);
  }

  @Post('/')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  createPost(@Body() createPostDto: CreatePostDto, @GetUser() user: User) {
    return this.postService.createPost(createPostDto, user);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    updatePostDto: CreatePostDto,
    @GetUser() user: User,
  ) {
    return this.postService.updatePost(id, updatePostDto, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  deletePost(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.postService.deletePost(id, user);
  }

  @Post('/:postId/vote/:voteOptionId')
  @UseGuards(AuthGuard())
  voteOnPost(
    @Param('postId') postId: number,
    @Param('voteOptionId') voteOptionId: number,
    @GetUser() user: User,
  ) {
    return this.postService.voteOnPost(postId, voteOptionId, user);
  }
}
