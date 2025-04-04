import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsArray,
  ValidateNested,
  IsNumber,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

enum VisualizationType {
  IMAGE = 'IMAGE',
  ANIMATION = 'ANIMATION',
  VIDEO = 'VIDEO'
}

export class WordImageMappingDto {
  @ApiProperty({ description: 'Word timestamp ID' })
  @IsString()
  @IsNotEmpty()
  wordTimestampId: string;

  @ApiProperty({ description: 'Reference image ID' })
  @IsString()
  @IsNotEmpty()
  referenceImageId: string;

  @ApiPropertyOptional({ 
    description: 'Timestamp in seconds (for timeline-based visualizations)',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  timestamp?: number;
}

export class CreateVisualizationDto {
  @ApiPropertyOptional({ description: 'Song ID' })
  @IsString()
  @IsOptional()
  songId?: string;

  @ApiPropertyOptional({ description: 'Clip ID' })
  @IsString()
  @IsOptional()
  clipId?: string;

  @ApiProperty({ description: 'Visualization name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Visualization description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'AI generation prompt',
    example: 'Generate a surreal landscape with lyrics-inspired elements'
  })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiProperty({ 
    description: 'Visualization type',
    enum: VisualizationType,
    default: VisualizationType.IMAGE
  })
  @IsEnum(VisualizationType)
  @IsOptional()
  visualizationType?: VisualizationType;

  @ApiPropertyOptional({ 
    description: 'Word-to-image mappings',
    type: [WordImageMappingDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WordImageMappingDto)
  @IsOptional()
  wordImageMappings?: WordImageMappingDto[];
}