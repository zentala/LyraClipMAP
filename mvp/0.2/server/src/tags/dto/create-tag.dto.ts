import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

enum TagCategory {
  GENERAL = 'GENERAL',
  GENRE = 'GENRE',
  MOOD = 'MOOD',
  ENERGY = 'ENERGY',
  SENTIMENT = 'SENTIMENT',
  TEMPO = 'TEMPO',
  THEME = 'THEME'
}

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Tag category',
    enum: TagCategory,
    default: TagCategory.GENERAL
  })
  @IsEnum(TagCategory)
  @IsOptional()
  category?: TagCategory;
}