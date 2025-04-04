import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async create(data: { name: string; description?: string; category?: string }) {
    return this.prisma.tag.create({
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
      },
      include: {
        songs: true,
      },
    });
  }

  async findAll() {
    return this.prisma.tag.findMany({
      include: {
        songs: true,
      },
    });
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        songs: true,
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return tag;
  }

  async update(id: number, data: { name?: string; description?: string; category?: string }) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        category: data.category,
      },
      include: {
        songs: true,
      },
    });
  }

  async remove(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  async addTagToSong(songId: number, tagId: number) {
    const song = await this.prisma.song.findUnique({
      where: { id: songId },
    });

    if (!song) {
      throw new NotFoundException(`Song with ID ${songId} not found`);
    }

    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${tagId} not found`);
    }

    return this.prisma.songTag.create({
      data: {
        song: {
          connect: { id: songId },
        },
        tag: {
          connect: { id: tagId },
        },
      },
    });
  }

  async removeTagFromSong(songId: number, tagId: number) {
    const songTag = await this.prisma.songTag.findFirst({
      where: {
        songId,
        tagId,
      },
    });

    if (!songTag) {
      throw new NotFoundException(`Tag ${tagId} is not assigned to song ${songId}`);
    }

    return this.prisma.songTag.delete({
      where: {
        id: songTag.id,
      },
    });
  }
} 