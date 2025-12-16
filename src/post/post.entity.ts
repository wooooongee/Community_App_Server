import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/auth/user.entity';
import { Image } from 'src/image/image.entity';
import { Comment } from 'src/comment/comment.entity';
import { Vote } from 'src/vote/vote.entity';
import { Like } from 'src/like/like.entity';

@Entity()
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Image, (image) => image.post, { onDelete: 'CASCADE' })
  images: Image[];

  @OneToMany(() => Comment, (comment) => comment.post, {
    eager: true,
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => Vote, (vote) => vote.post, { onDelete: 'CASCADE' })
  votes: Vote[];

  @OneToMany(() => Like, (like) => like.post, { onDelete: 'CASCADE' })
  likes: Like[];

  @ManyToOne(() => User, (user) => user.post)
  user: User;

  @Column()
  userId: number;
}
