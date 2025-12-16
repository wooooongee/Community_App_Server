import { Injectable } from '@nestjs/common';
import { avatarLength } from 'src/@common/contants';

@Injectable()
export class AvatarService {
  getAvatarList(type: string): string[] {
    const array = Array.from({ length: avatarLength[type] }, (_, i) =>
      String(i + 1).padStart(2, '0'),
    );

    return array.map((num) => `${type}/${num}.png`);
  }
}
