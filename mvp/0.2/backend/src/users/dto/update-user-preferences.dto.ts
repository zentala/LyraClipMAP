import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateUserPreferencesDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  notifications?: boolean;
} 