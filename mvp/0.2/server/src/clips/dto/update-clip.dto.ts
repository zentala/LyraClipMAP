import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateClipDto } from './create-clip.dto';

export class UpdateClipDto extends PartialType(CreateClipDto) {
  @ApiPropertyOptional({ description: 'Clip name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Clip description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Start time in seconds',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  startTime?: number;

  @ApiPropertyOptional({ 
    description: 'End time in seconds',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  endTime?: number;
}