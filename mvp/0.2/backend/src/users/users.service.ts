import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findAll(): Promise<Partial<User>[]> {
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

  async create(data: { email: string; password: string; username: string }): Promise<Partial<User>> {
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

  async update(id: number, data: { email?: string; password?: string; username?: string }): Promise<Partial<User>> {
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

  async delete(id: number): Promise<User> {
    await this.findById(id);
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async getUserPreferences(userId: number) {
    await this.findById(userId);
    const preferences = await this.prisma.$queryRaw`
      SELECT * FROM "UserPreferences" WHERE "userId" = ${userId}
    `;
    return preferences[0] || null;
  }

  async updateUserPreferences(userId: number, data: UpdateUserPreferencesDto) {
    await this.findById(userId);
    const existingPreferences = await this.getUserPreferences(userId);

    if (existingPreferences) {
      return this.prisma.$executeRaw`
        UPDATE "UserPreferences"
        SET
          "theme" = ${data.theme || existingPreferences.theme},
          "language" = ${data.language || existingPreferences.language},
          "notifications" = ${data.notifications ?? existingPreferences.notifications},
          "updatedAt" = NOW()
        WHERE "userId" = ${userId}
      `;
    } else {
      return this.prisma.$executeRaw`
        INSERT INTO "UserPreferences" ("userId", "theme", "language", "notifications")
        VALUES (
          ${userId},
          ${data.theme || 'light'},
          ${data.language || 'en'},
          ${data.notifications ?? true}
        )
      `;
    }
  }
} 