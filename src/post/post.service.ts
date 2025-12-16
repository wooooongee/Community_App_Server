import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Image } from 'src/image/image.entity';
import { User } from 'src/auth/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { Comment } from 'src/comment/comment.entity';
import { VoteOption } from 'src/vote-option/vote-option.entity';
import { Vote } from 'src/vote/vote.entity';
import { UserVote } from 'src/user-vote/user-vote.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Vote)
    private voteRepository: Repository<Vote>,
    @InjectRepository(VoteOption)
    private voteOptionRepository: Repository<VoteOption>,
    @InjectRepository(UserVote)
    private userVoteRepository: Repository<UserVote>,
  ) {}

  private async getPostsBaseQuery(): Promise<SelectQueryBuilder<Post>> {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.images', 'image')
      .leftJoinAndSelect('post.user', 'postUser')
      .leftJoinAndSelect('post.votes', 'vote')
      .leftJoinAndSelect('vote.options', 'voteOption')
      .leftJoinAndSelect('voteOption.userVotes', 'userVote')
      .leftJoin('userVote.user', 'user')
      .addSelect('user.id')
      .leftJoinAndSelect('post.likes', 'like')
      .leftJoin('like.user', 'likeUser')
      .addSelect(['likeUser.id'])
      .loadRelationCountAndMap(
        'post.commentCount',
        'post.comments',
        'comment',
        (qb) => qb.where('comment.isDeleted = false'),
      )
      .orderBy('post.createdAt', 'DESC');
  }

  private async convertPostsResult(posts: Post[]) {
    return posts.map((post) => {
      const { user, images, likes, votes, ...rest } = post;
      const newImages = [...images].sort((a, b) => a.id - b.id);
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

      return {
        ...rest,
        author,
        imageUris: newImages,
        likes: newLikes,
        voteCount: totalVotes,
        hasVote: Boolean(votes.length),
      };
    });
  }

  async getPosts(page: number) {
    const perPage = 10;
    const offset = (page - 1) * perPage;
    const queryBuilder = await this.getPostsBaseQuery();
    const posts = await queryBuilder.take(perPage).skip(offset).getMany();

    return await this.convertPostsResult(posts);
  }

  async getPostsByUserId(page: number, userId: number) {
    const perPage = 10;
    const offset = (page - 1) * perPage;
    const queryBuilder = await this.getPostsBaseQuery();
    const posts = await queryBuilder
      .where('post.userId = :userId', { userId: userId })
      .take(perPage)
      .skip(offset)
      .getMany();

    return await this.convertPostsResult(posts);
  }

  async getMyPosts(page: number, user: User) {
    return await this.getPostsByUserId(page, user.id);
  }

  private async findPostById(id: number) {
    try {
      const foundPost = await this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.user', 'postUser')
        .leftJoinAndSelect('post.images', 'image')
        .leftJoinAndSelect('post.comments', 'comment')
        .leftJoinAndSelect('comment.user', 'commentUser')
        .leftJoinAndSelect('comment.replies', 'reply')
        .leftJoinAndSelect('reply.user', 'replyUser')
        .leftJoinAndSelect('post.votes', 'vote')
        .leftJoinAndSelect('vote.options', 'voteOption')
        .leftJoinAndSelect('voteOption.userVotes', 'userVote')
        .leftJoin('userVote.user', 'user')
        .addSelect('user.id')
        .leftJoinAndSelect('post.likes', 'like')
        .leftJoin('like.user', 'likeUser')
        .addSelect(['likeUser.id'])
        .where('post.id = :id', { id })
        .andWhere('comment.parentComment IS NULL')
        .orderBy('voteOption.displayPriority', 'ASC')
        .getOne();

      if (!foundPost) {
        throw new NotFoundException('존재하지 않는 게시글입니다.');
      }
      return foundPost;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '게시글을 가져오는 도중 에러가 발생했습니다.',
      );
    }
  }

  async getPostById(id: number) {
    try {
      await this.postRepository.increment({ id }, 'viewCount', 1);

      const foundPost = await this.findPostById(id);

      const getCommentCount = (comments: Comment[]) => {
        return comments.reduce((acc, cur) => {
          const commentCount = cur.isDeleted === true ? 0 : 1;
          const repliesCount = cur.replies?.filter(
            (reply) => reply.isDeleted !== true,
          ).length;
          return acc + commentCount + repliesCount;
        }, 0);
      };
      const processComments = (comments: Comment[]) => {
        return comments.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          user: {
            id: comment.user?.id ?? null,
            nickname: comment.user?.nickname ?? null,
            imageUri: comment.user?.imageUri ?? null,
          },
          isDeleted: comment.isDeleted,
          replies: comment.replies.map((reply) => ({
            id: reply.id,
            content: reply.content,
            createdAt: reply.createdAt,
            user: {
              id: reply.user?.id ?? null,
              nickname: reply.user?.nickname ?? null,
              imageUri: reply.user?.imageUri ?? null,
            },
            isDeleted: reply.isDeleted,
          })),
        }));
      };

      const { user, images, likes, votes, ...postWithoutUser } = foundPost;
      const newLikes = likes.map((like) => ({ userId: like.user.id }));
      const newVotes = votes.map((vote) => {
        return {
          ...vote,
          options: vote.options.map((option) => ({
            ...option,
            userVotes: option.userVotes.map((userVote) => ({
              userId: userVote.user.id,
            })),
          })),
        };
      });
      const totalVotes = votes.reduce((sum, vote) => {
        return (
          sum +
          vote.options.reduce((optionSum, option) => {
            return optionSum + option.userVotes.length;
          }, 0)
        );
      }, 0);

      return {
        ...postWithoutUser,
        imageUris: images,
        likes: newLikes,
        votes: newVotes,
        author: {
          id: foundPost.user?.id ?? null,
          nickname: foundPost.user?.nickname ?? null,
          imageUri: foundPost.user?.imageUri ?? null,
        },
        commentCount: getCommentCount(foundPost.comments),
        comments: processComments(foundPost.comments).sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
        voteCount: totalVotes,
        hasVote: Boolean(foundPost.votes.length),
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '게시글을 가져오는 도중 에러가 발생했습니다.',
      );
    }
  }

  async createPost(createPostDto: CreatePostDto, user: User) {
    const { title, description, imageUris, voteTitle, voteOptions } =
      createPostDto;

    const post = this.postRepository.create({
      title,
      description,
      user,
    });
    const images = imageUris.map((uri) => this.imageRepository.create(uri));
    post.images = images;

    try {
      await this.imageRepository.save(images);
      await this.postRepository.save(post);

      if (voteOptions?.length > 1) {
        const vote = new Vote();
        vote.title = voteTitle ?? '';
        vote.post = post;

        vote.options = voteOptions.map((option) => {
          const voteOption = new VoteOption();
          voteOption.displayPriority = option.displayPriority;
          voteOption.content = option.content;
          voteOption.vote = vote;
          return voteOption;
        });

        await this.voteRepository.save(vote);
        await this.voteOptionRepository.save(vote.options);
      }

      return post.id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '게시글 등록 도중 에러가 발생했습니다.',
      );
    }
  }

  async updatePost(id: number, updatePostDto: CreatePostDto, user: User) {
    const post = await this.findPostById(id);
    if (post.userId !== user.id) {
      throw new UnauthorizedException('수정 권한이 없습니다.');
    }
    const { title, description, imageUris } = updatePostDto;
    if (title) {
      post.title = title;
    }
    if (description) {
      post.description = description;
    }
    const images = imageUris.map((uri) => this.imageRepository.create(uri));
    post.images = images;

    try {
      await this.imageRepository.save(images);
      await this.postRepository.save(post);
      return post.id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '게시글 수정 도중 에러가 발생했습니다.',
      );
    }
  }

  async deletePost(id: number, user: User) {
    try {
      const result = await this.postRepository
        .createQueryBuilder('post')
        .delete()
        .from(Post)
        .where('userId = :userId', { userId: user.id })
        .andWhere('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('존재하지 않는 게시글입니다.');
      }

      return id;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '게시글 삭제 도중 에러가 발생했습니다.',
      );
    }
  }

  async voteOnPost(postId: number, voteOptionId: number, user: User) {
    const voteOption = await this.voteOptionRepository.findOne({
      where: { id: voteOptionId },
    });
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!voteOption) {
      throw new NotFoundException('존재하지 않는 투표입니다.');
    }
    if (!post) {
      throw new NotFoundException('존재하지 않는 게시글입니다.');
    }

    const existingVote = await this.userVoteRepository
      .createQueryBuilder('userVote')
      .leftJoin('userVote.voteOption', 'voteOption')
      .leftJoin('voteOption.vote', 'vote')
      .where('userVote.userId = :userId', { userId: user.id })
      .andWhere('vote.postId = :postId', { postId })
      .getOne();

    if (existingVote) {
      throw new UnauthorizedException('이미 참여한 투표입니다.');
    }

    const userVote = this.userVoteRepository.create({
      user,
      voteOption,
    });

    try {
      await this.userVoteRepository.save(userVote);
      return {
        postId: post.id,
        voteOption: userVote.voteOption,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        '투표 등록 도중 에러가 발생했습니다.',
      );
    }
  }

  async searchPostsByTitle(query: string, page: number) {
    const perPage = 10;
    const offset = (page - 1) * perPage;
    const queryBuilder = await this.getPostsBaseQuery();
    const posts = await queryBuilder
      .andWhere(
        new Brackets((qb) => {
          qb.where('post.title like :query', { query: `%${query}%` });
        }),
      )
      .skip(offset)
      .take(perPage)
      .getMany();

    return await this.convertPostsResult(posts);
  }
}
