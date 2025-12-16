import { Post } from 'src/post/post.entity';
import { UserVote } from 'src/user-vote/user-vote.entity';
import { Vote } from 'src/vote/vote.entity';
import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class VoteOption extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  displayPriority: number;

  @Column()
  content: string;

  @ManyToOne(() => Vote, (vote) => vote.options, {
    onDelete: 'CASCADE',
  })
  vote: Vote;

  @OneToMany(() => UserVote, (userVote) => userVote.voteOption, {
    onDelete: 'CASCADE',
  })
  userVotes: UserVote[];
}
