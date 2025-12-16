import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { AuthService } from 'src/auth/auth.service';
import { Comment } from './comment.entity';
import { Post } from 'src/post/post.entity';
import { User } from 'src/auth/user.entity';
import { NotificationService } from 'src/notification/notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User]), AuthModule],
  controllers: [CommentController],
  providers: [CommentService, AuthService, JwtService, NotificationService],
})
export class CommentModule {}
