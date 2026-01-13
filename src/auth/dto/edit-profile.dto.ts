import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class LoreleiAvatarConfigDto {
  @IsString()
  seed: string;

  @IsOptional()
  @IsBoolean()
  flip?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  backgroundColor?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hair?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eyes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eyebrows?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mouth?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nose?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  glasses?: string[];

  @IsOptional()
  @IsNumber()
  glassesProbability?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  earrings?: string[];

  @IsOptional()
  @IsNumber()
  earringsProbability?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  head?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  beard?: string[];

  @IsOptional()
  @IsNumber()
  beardProbability?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  freckles?: string[];

  @IsOptional()
  @IsNumber()
  frecklesProbability?: number;
}

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

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LoreleiAvatarConfigDto)
  avatarConfig?: LoreleiAvatarConfigDto;
}
