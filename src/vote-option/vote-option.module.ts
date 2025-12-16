import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { VoteOption } from './vote-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VoteOption]), AuthModule],
})
export class VoteOptionModule {}
