import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateClipDto {
  @ApiProperty({ description: 'Song ID' })
  @IsString()
  @IsNotEmpty()
  songId: string;

  @ApiProperty({ description: 'Clip name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Clip description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ 
    description: 'Start time in seconds',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  startTime: number;

  @ApiProperty({ 
    description: 'End time in seconds',
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  endTime: number;
}