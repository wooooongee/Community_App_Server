import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/post/post.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}

  async getPostAuthorId(postId: number) {
    const post = await this.postRepository.findOneBy({ id: postId });

    return post.userId;
  }

  async getParentCommentAuthorId(parentCommentId: number) {
    const parentComment = await this.commentRepository.findOneBy({
      id: parentCommentId,
    });

    return parentComment.userId;
  }

  async createComment(createCommentDto: CreateCommentDto, user: User) {
    const { content, postId, parentCommentId } = createCommentDto;
    const comment = this.commentRepository.create({ content, postId, user });

    if (parentCommentId) {
      const parentComment = await this.commentRepository.findOneBy({
        id: parentCommentId,
      });

      if (!parentComment) {
        throw new NotFoundException('존재하지 않는 댓글입니다.');
      }
      comment.parentComment = parentComment;
    }

    await this.commentRepository.save(comment);
    return comment.postId;
  }

  async getCommentsByPostId(postId: number) {
    const comments = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('reply.user', 'replyUser')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentComment IS NULL')
      .getMany();

    return comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      user: {
        id: comment.user.id,
        nickname: comment.user.nickname,
        imageUri: comment.user.imageUri,
      },
      replies: comment.replies.map((reply) => ({
        id: reply.id,
        content: reply.content,
        createdAt: reply.createdAt,
        user: {
          id: reply.user.id,
          nickname: reply.user.nickname,
          imageUri: reply.user.imageUri,
        },
      })),
    }));
  }

  async deleteComment(id: number, user: User) {
    const comment = await this.commentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    if (user.id !== comment.userId) {
      throw new UnauthorizedException('삭제 권한이 없습니다.');
    }

    comment.isDeleted = true;
    comment.user = null;
    await this.commentRepository.save(comment);
    return comment.postId;
  }
}
