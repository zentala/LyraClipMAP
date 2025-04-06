import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlaylistDto {
  @ApiPropertyOptional({ description: 'The name of the playlist' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'The description of the playlist' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the playlist is public' })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
} 