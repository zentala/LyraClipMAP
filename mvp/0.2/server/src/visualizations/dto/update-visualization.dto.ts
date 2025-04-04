import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateVisualizationDto } from './create-visualization.dto';

enum VisualizationStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export class UpdateVisualizationDto extends PartialType(CreateVisualizationDto) {
  @ApiPropertyOptional({ description: 'Visualization name' })
  @IsString()
  @IsOptional()
  name?: string;

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

  @ApiPropertyOptional({ 
    description: 'Visualization status',
    enum: VisualizationStatus
  })
  @IsEnum(VisualizationStatus)
  @IsOptional()
  status?: VisualizationStatus;
}