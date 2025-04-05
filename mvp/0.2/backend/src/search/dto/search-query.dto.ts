import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by artist name' })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiPropertyOptional({ description: 'Filter by genre' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ description: 'Filter by release year from' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearFrom?: number;

  @ApiPropertyOptional({ description: 'Filter by release year to' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  yearTo?: number;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
} 