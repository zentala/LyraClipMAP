import { Module } from '@nestjs/common';
import { TagService } from './tags.service';
import { TagController } from './tags.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagsModule {} 