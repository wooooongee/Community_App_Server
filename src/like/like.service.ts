import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './like.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
  ) {}

  async getMyLikePosts(page: number, user: User) {
    const perPage = 10;
    const offset = (page - 1) * perPage;
    const likePosts = await this.likeRepository
      .createQueryBuilder('like')
      .innerJoinAndSelect('like.post', 'post')
      .leftJoinAndSelect('post.images', 'image')
      .leftJoinAndSelect('post.user', 'postUser')
      .leftJoinAndSelect('post.votes', 'vote')
      .leftJoinAndSelect('vote.options', 'voteOption')
      .leftJoinAndSelect('voteOption.userVotes', 'userVote')
      .leftJoin('userVote.user', 'user')
      .addSelect('user.id')
      .leftJoinAndSelect('post.likes', 'likeEntity')
      .leftJoinAndSelect('likeEntity.user', 'likeUser')
      .loadRelationCountAndMap(
        'post.commentCount',
        'post.comments',
        'comment',
        (qb) => qb.where('comment.isDeleted = false'),
      )
      .loadRelationCountAndMap('post.likeCount', 'post.likes')
      .where('like.userId = :userId', { userId: user.id })
      .orderBy('like.createdAt', 'DESC')
      .skip(offset)
      .take(perPage)
      .getMany();

    const newPosts = likePosts.map((like) => {
      const { user, votes, likes, images, ...rest } = like.post;
      const author = {
        id: user?.id ?? null,
        nickname: user?.nickname ?? null,
        imageUri: user?.imageUri ?? null,
      };
      const newLikes = likes.map((like) => ({ userId: like.user.id }));
      const totalVotes = votes.reduce((sum, vote) => {
        return (
          sum +
          vote.options.reduce((optionSum, option) => {
            return optionSum + option.userVotes.length;
          }, 0)
        );
      }, 0);
      const newImages = [...images].sort((a, b) => (a.id = b.id));

      return {
        ...rest,
        author,
        imageUris: newImages,
        likes: newLikes,
        voteCount: totalVotes,
        hasVote: Boolean(votes.length),
      };
    });

    return newPosts;
  }

  async toggleLike(postId: number, user: User): Promise<number> {
    if (!postId) {
      throw new BadRequestException('존재하지 않는 게시글입니다.');
    }

    const existingLike = await this.likeRepository.findOne({
      where: { post: { id: postId }, user: { id: user.id } },
    });

    if (existingLike) {
      await this.likeRepository.delete(existingLike.id);
      return postId;
    }

    const like = this.likeRepository.create({
      post: { id: postId },
      user: { id: user.id },
    });
    await this.likeRepository.save(like);

    return postId;
  }
}
