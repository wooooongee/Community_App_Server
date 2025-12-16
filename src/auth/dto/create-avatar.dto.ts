import { IsOptional, IsString } from 'class-validator';

export class CreateAvatarDto {
  @IsOptional()
  @IsString()
  topId?: string;

  @IsOptional()
  @IsString()
  bottomId?: string;

  @IsOptional()
  @IsString()
  faceId?: string;

  @IsOptional()
  @IsString()
  hatId?: string;

  @IsOptional()
  @IsString()
  handId?: string;

  @IsOptional()
  @IsString()
  skinId?: string;
}
