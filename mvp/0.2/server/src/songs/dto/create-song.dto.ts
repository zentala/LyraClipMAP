import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsInt, 
  IsArray, 
  ValidateNested,
  Min, 
  IsUrl,
  IsEnum 
} from 'class-validator';
import { Type } from 'class-transformer';
import { SourceType } from '@prisma/client';

export class CreateAudioSourceDto {
  @ApiProperty({ description: 'Audio source URL' })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ 
    description: 'Audio source type',
    enum: SourceType,
    default: SourceType.YOUTUBE
  })
  @IsEnum(SourceType)
  sourceType: SourceType;

  @ApiPropertyOptional({ 
    description: 'Whether this is the main audio source',
    default: false
  })
  @IsOptional()
  isMain?: boolean;
}

export class CreateSongDto {
  @ApiProperty({ description: 'Song title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Artist ID' })
  @IsString()
  @IsNotEmpty()
  artistId: string;

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

  @ApiProperty({ 
    description: 'Audio sources',
    type: [CreateAudioSourceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAudioSourceDto)
  audioSources: CreateAudioSourceDto[];
}