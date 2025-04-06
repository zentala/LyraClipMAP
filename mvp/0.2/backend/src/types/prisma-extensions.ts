import { Prisma } from '@prisma/client';

export interface SongExtended {
  id?: number;
  title: string;
  artistId: number;
  duration: number;
  lyricsId: number;
  genre: string;
  releaseYear: number;
  audioUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LyricsExtended {
  id?: number;
  text: string;
  language: string;
  sourceUrl?: string;
  timestamps?: Prisma.JsonValue;
  createdAt?: Date;
  updatedAt?: Date;
  songs?: any[];
}

export type SongCreateInput = Omit<SongExtended, 'id' | 'createdAt' | 'updatedAt'>;
export type LyricsCreateInput = {
  text: string;
  language: string;
  sourceUrl?: string;
  timestamps?: Prisma.JsonValue;
  songs?: {
    connect?: { id: number }[];
    create?: any[];
  };
};
