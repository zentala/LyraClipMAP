import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

enum UploadPurpose {
  AUDIO = 'AUDIO',
  IMAGE = 'IMAGE',
  REFERENCE_IMAGE = 'REFERENCE_IMAGE',
  LYRICS = 'LYRICS',
  OTHER = 'OTHER'
}

export class UploadFileDto {
  @ApiProperty({ 
    description: 'File purpose',
    enum: UploadPurpose
  })
  @IsEnum(UploadPurpose)
  purpose: UploadPurpose;

  @ApiPropertyOptional({ 
    description: 'Associated song ID (if applicable)'
  })
  @IsString()
  @IsOptional()
  songId?: string;

  // The actual file will be provided via multipart/form-data
  // and handled by a file interceptor in the controller
}