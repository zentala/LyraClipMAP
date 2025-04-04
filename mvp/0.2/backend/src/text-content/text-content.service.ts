import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TextContentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { content: string; type: string; language?: string }) {
    return this.prisma.textContent.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.textContent.findMany();
  }

  async findOne(id: number) {
    return this.prisma.textContent.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: { content?: string; type?: string; language?: string }) {
    return this.prisma.textContent.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.textContent.delete({
      where: { id },
    });
  }

  async detectLanguage(text: string) {
    // TODO: Implementacja wykrywania języka
    return 'en';
  }
} 