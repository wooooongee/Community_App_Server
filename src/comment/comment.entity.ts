import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Post } from 'src/post/post.entity';

@Entity()
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.comments)
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    nullable: false,
    eager: false,
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column({ nullable: true })
  postId: number;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    eager: false,
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentComment: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];
}
