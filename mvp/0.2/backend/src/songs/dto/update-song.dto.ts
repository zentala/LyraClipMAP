import { IsString, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';

export class UpdateSongDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  artistId?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsUrl()
  audioUrl?: string;

  @IsOptional()
  @IsNumber()
  lyricsId?: number;
} 