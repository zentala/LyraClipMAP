import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaylistDto {
  @ApiProperty({ description: 'The name of the playlist' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'The description of the playlist' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Whether the playlist is public', default: false })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
} 