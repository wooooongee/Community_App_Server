import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVoteOptionDto {
  displayPriority: number;
  content: string;
}

export class CreatePostDto {
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  imageUris: { uri: string }[];

  @IsOptional()
  @IsString()
  voteTitle?: string;

  @IsOptional()
  @IsArray()
  voteOptions?: CreateVoteOptionDto[];
}
