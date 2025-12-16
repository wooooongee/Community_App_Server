import { Post } from 'src/post/post.entity';
import { VoteOption } from 'src/vote-option/vote-option.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Vote extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToOne(() => Post, (post) => post.votes, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @OneToMany(() => VoteOption, (voteOption) => voteOption.vote, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  options: VoteOption[];
}
