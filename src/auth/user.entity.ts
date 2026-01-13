import { Comment } from 'src/comment/comment.entity';
import { Like } from 'src/like/like.entity';
import { Post } from 'src/post/post.entity';
import { UserVote } from 'src/user-vote/user-vote.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

export interface LoreleiAvatarConfig {
  seed: string;
  flip?: boolean;
  backgroundColor?: string[];
  hair?: string[];
  eyes?: string[];
  eyebrows?: string[];
  mouth?: string[];
  nose?: string[];
  glasses?: string[];
  glassesProbability?: number;
  earrings?: string[];
  earringsProbability?: number;
  head?: string[];
  beard?: string[];
  beardProbability?: number;
  freckles?: string[];
  frecklesProbability?: number;
}

@Entity()
@Unique(['email'])
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  loginType: 'email' | 'kakao';

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  nickname?: string;

  @Column({ nullable: true })
  introduce?: string;

  @Column({ nullable: true })
  imageUri?: string;

  @Column({ nullable: true })
  expoPushToken?: string;

  @Column({ nullable: true })
  hatId: string;

  @Column({ nullable: true })
  faceId: string;

  @Column({ nullable: true })
  topId: string;

  @Column({ nullable: true })
  bottomId: string;

  @Column({ nullable: true })
  handId: string;

  @Column({ default: '01' })
  skinId: string;

  @Column({ nullable: true })
  background: string;

  @Column({ type: 'json', nullable: true })
  avatarConfig: LoreleiAvatarConfig;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Post, (post) => post.user)
  post: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => UserVote, (userVote) => userVote.user)
  userVotes: UserVote[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
