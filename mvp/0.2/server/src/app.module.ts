import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SongsModule } from './songs/songs.module';
import { ArtistsModule } from './artists/artists.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { TextContentsModule } from './text-contents/text-contents.module';
import { YoutubeModule } from './youtube/youtube.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { ClipsModule } from './clips/clips.module';
import { VisualizationsModule } from './visualizations/visualizations.module';
import { UploadsModule } from './uploads/uploads.module';
import { TagsModule } from './tags/tags.module';
import { SpotifyModule } from './spotify/spotify.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database
    PrismaModule,
    
    // Feature modules
    AuthModule,
    UsersModule,
    SongsModule,
    ArtistsModule,
    PlaylistsModule,
    TextContentsModule,
    YoutubeModule,
    LyricsModule,
    ClipsModule,
    VisualizationsModule,
    UploadsModule,
    TagsModule,
    SpotifyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}