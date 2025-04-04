import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { UpdateArtistDto } from './dto/update-artist.dto';

@Injectable()
export class ArtistsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateImageUrl(url: string): void {
    if (!url) return;
    
    try {
      new URL(url);
    } catch (error) {
      throw new BadRequestException('Invalid image URL format');
    }
  }

  async create(createArtistDto: CreateArtistDto) {
    if (!createArtistDto.name) {
      throw new BadRequestException('Name is required');
    }
    
    if (createArtistDto.imageUrl) {
      this.validateImageUrl(createArtistDto.imageUrl);
    }
    
    return this.prisma.artist.create({
      data: createArtistDto,
    });
  }

  async findAll() {
    return this.prisma.artist.findMany();
  }

  async findOne(id: number) {
    const artist = await this.prisma.artist.findUnique({
      where: { id },
    });

    if (!artist) {
      throw new NotFoundException(`Artist with ID ${id} not found`);
    }

    return artist;
  }

  async update(id: number, updateArtistDto: UpdateArtistDto) {
    await this.findOne(id);

    return this.prisma.artist.update({
      where: { id },
      data: updateArtistDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.artist.delete({
      where: { id },
    });
  }
} 