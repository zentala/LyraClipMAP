import { IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateArtistDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
} 