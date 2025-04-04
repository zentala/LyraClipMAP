import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, IsUrl, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) {
  @ApiPropertyOptional({ description: 'Song title' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Artist ID' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  artistId?: string;

  @ApiPropertyOptional({ description: 'Song description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Song duration in seconds',
    minimum: 0
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Song thumbnail URL' })
  @IsString()
  @IsUrl()
  @IsOptional()
  thumbnailUrl?: string;
}