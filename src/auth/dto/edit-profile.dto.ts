import { IsString, MaxLength, MinLength } from 'class-validator';

export class EditProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname: string;

  @IsString()
  introduce: string;

  @IsString()
  imageUri: string;

  @IsString()
  hatId: string;

  @IsString()
  faceId: string;

  @IsString()
  topId: string;

  @IsString()
  bottomId: string;

  @IsString()
  handId: string;

  @IsString()
  skinId: string;

  @IsString()
  background: string;
}
