import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tags.service';
import { AuthGuard } from '../auth/guards/auth.guard';

type CreateTagDto = {
  name: string;
  description?: string;
  category?: string;
};

type UpdateTagDto = {
  name?: string;
  description?: string;
  category?: string;
};

@Controller('tags')
@UseGuards(AuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  findAll() {
    return this.tagService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.update(+id, updateTagDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tagService.remove(+id);
  }

  @Post('songs/:songId/tags/:tagId')
  addTagToSong(
    @Param('songId') songId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagService.addTagToSong(+songId, +tagId);
  }

  @Delete('songs/:songId/tags/:tagId')
  removeTagFromSong(
    @Param('songId') songId: string,
    @Param('tagId') tagId: string,
  ) {
    return this.tagService.removeTagFromSong(+songId, +tagId);
  }
} 