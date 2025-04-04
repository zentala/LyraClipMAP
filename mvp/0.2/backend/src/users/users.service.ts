import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: { email: string; password: string; username: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, data: { email?: string; password?: string; username?: string }) {
    const user = await this.findById(id);

    const updateData = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserPreferences(userId: number) {
    const user = await this.findById(userId);
    
    let preferences = await this.prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      preferences = await this.prisma.userPreferences.create({
        data: { userId },
      });
    }

    return preferences;
  }

  async updateUserPreferences(userId: number, data: UpdateUserPreferencesDto) {
    await this.findById(userId);

    const preferences = await this.prisma.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return preferences;
  }
} 