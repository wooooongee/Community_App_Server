import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  content: string;
  postId: number;
  parentCommentId?: number;
}
