import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Post } from './post.entity';
import { Image } from 'src/image/image.entity';
import { Comment } from 'src/comment/comment.entity';
import { Vote } from 'src/vote/vote.entity';
import { VoteOption } from 'src/vote-option/vote-option.entity';
import { UserVote } from 'src/user-vote/user-vote.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Image,
      Comment,
      Vote,
      VoteOption,
      UserVote,
    ]),
    AuthModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
