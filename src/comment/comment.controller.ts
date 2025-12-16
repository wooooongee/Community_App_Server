import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/@common/decorators/get-user.decorator';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notification/notification.service';

@Controller('comments')
export class CommentController {
  constructor(
    private commentService: CommentService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  @Post('/')
  @UseGuards(AuthGuard())
  @UsePipes(ValidationPipe)
  async createComment(
    @Body() createCommentDto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    const postAuthorId = await this.commentService.getPostAuthorId(
      createCommentDto.postId,
    );
    const postAuthorPushToken =
      await this.authService.getPushToken(postAuthorId);

    if (
      Number(user.id) !== Number(postAuthorId) &&
      Boolean(postAuthorPushToken)
    ) {
      await this.notificationService.sendPushNotifications(
        [postAuthorPushToken],
        '새로운 댓글이 달렸어요: ',
        createCommentDto.content,
        `/post/${createCommentDto.postId}`,
      );
    }

    if (createCommentDto.parentCommentId) {
      const parentCommentAuthorId =
        await this.commentService.getParentCommentAuthorId(
          createCommentDto.parentCommentId,
        );
      const parentCommentAuthorToken = await this.authService.getPushToken(
        parentCommentAuthorId,
      );

      if (
        Number(parentCommentAuthorId) !== Number(postAuthorId) &&
        Number(user.id) !== Number(parentCommentAuthorId) &&
        Boolean(parentCommentAuthorToken)
      ) {
        await this.notificationService.sendPushNotifications(
          [parentCommentAuthorToken],
          '새로운 대댓글이 달렸어요: ',
          createCommentDto.content,
          `/post/${createCommentDto.postId}`,
        );
      }
    }

    return this.commentService.createComment(createCommentDto, user);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteComment(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.commentService.deleteComment(id, user);
  }
}
