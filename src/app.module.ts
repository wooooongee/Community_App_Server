import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './@common/logger';
import { PostModule } from './post/post.module';
import { ImageModule } from './image/image.module';
import { CommentModule } from './comment/comment.module';
import { VoteModule } from './vote/vote.module';
import { VoteOptionModule } from './vote-option/vote-option.module';
import { UserVoteModule } from './user-vote/user-vote.module';
import { LikeModule } from './like/like.module';
import { NotificationModule } from './notification/notification.module';
import { AvatarModule } from './avatar/avatar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity.{js,ts}'],
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    PostModule,
    AuthModule,
    ImageModule,
    CommentModule,
    VoteModule,
    VoteOptionModule,
    UserVoteModule,
    LikeModule,
    NotificationModule,
    AvatarModule,
  ],
  providers: [ConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
