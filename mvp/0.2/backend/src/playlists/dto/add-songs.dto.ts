import { IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddSongsDto {
  @ApiProperty({ description: 'Array of song IDs to add to the playlist', type: [Number] })
  @IsArray()
  @IsNumber({}, { each: true })
  songIds: number[];
} 