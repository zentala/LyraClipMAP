import { Module } from '@nestjs/common';
import { TextContentService } from './text-content.service';
import { TextContentController } from './text-content.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TextContentController],
  providers: [TextContentService],
  exports: [TextContentService],
})
export class TextContentModule {} 