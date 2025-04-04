import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreateReferenceImageDto {
  @ApiProperty({ 
    description: 'Image URL',
    example: 'https://example.com/images/reference.jpg'
  })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({ 
    description: 'Original prompt used to generate the image',
    example: 'A serene forest with glowing particles'
  })
  @IsString()
  @IsOptional()
  prompt?: string;

  @ApiPropertyOptional({ description: 'Image description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ 
    description: 'Tags/keywords associated with the image',
    type: [String],
    example: ['forest', 'serene', 'particles', 'glow']
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}