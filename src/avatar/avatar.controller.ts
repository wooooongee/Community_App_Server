import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('avatar')
@UseGuards(AuthGuard())
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  @Get('/:type')
  getAvatarList(@Param('type') type: string): string[] {
    const validTypes = ['tops', 'bottoms', 'faces', 'hands', 'hats', 'skins'];
    if (!validTypes.includes(type)) {
      throw new NotFoundException(`유효하지 않은 경로입니다: ${type}`);
    }
    return this.avatarService.getAvatarList(type);
  }
}
