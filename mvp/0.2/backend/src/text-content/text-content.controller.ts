import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { TextContentService } from './text-content.service';

@Controller('text-content')
export class TextContentController {
  constructor(private readonly textContentService: TextContentService) {}

  @Post()
  async create(@Body() data: { content: string; type: string; language?: string }) {
    return this.textContentService.create(data);
  }

  @Get()
  async findAll() {
    return this.textContentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.textContentService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: { content?: string; type?: string; language?: string },
  ) {
    return this.textContentService.update(+id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.textContentService.remove(+id);
  }

  @Post('detect-language')
  async detectLanguage(@Body('text') text: string) {
    return this.textContentService.detectLanguage(text);
  }
} 