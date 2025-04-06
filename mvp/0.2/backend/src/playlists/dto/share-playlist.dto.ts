import { IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PlaylistPermission } from '@prisma/client';

export class SharePlaylistDto {
  @ApiProperty({ description: 'ID of the user to share the playlist with' })
  @IsNumber()
  targetUserId: number;

  @ApiProperty({ description: 'Permission level for the shared playlist', enum: PlaylistPermission })
  @IsEnum(PlaylistPermission)
  permission: PlaylistPermission;
} 