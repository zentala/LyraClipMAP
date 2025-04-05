import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SongsModule } from './songs/songs.module';
import { ArtistsModule } from './artists/artists.module';
import { LyricsModule } from './lyrics/lyrics.module';
import { SearchModule } from './search/search.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    SongsModule,
    ArtistsModule,
    LyricsModule,
    SearchModule,
    PlaylistsModule,
  ],
})
export class AppModule {} 