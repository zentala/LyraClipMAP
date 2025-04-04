import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class AddTagToSongDto {
  @ApiProperty({ description: 'Tag ID or name (if new tag)' })
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @ApiPropertyOptional({ 
    description: 'Tag value (for numerical tags like energy level)',
    minimum: 0,
    maximum: 1,
    example: 0.75
  })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  value?: number;
}