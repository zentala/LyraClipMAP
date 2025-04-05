import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaylistPermission } from '@prisma/client';

export class SharePlaylistDto {
  @ApiProperty({ description: 'The ID of the user to share the playlist with' })
  @IsNumber()
  userId: number;

  @ApiProperty({ description: 'The permission level to grant', enum: PlaylistPermission })
  @IsEnum(PlaylistPermission)
  permission: PlaylistPermission;
} 