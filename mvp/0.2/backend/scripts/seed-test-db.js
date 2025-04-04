const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.test' });

const prisma = new PrismaClient();

async function seedTestDatabase() {
  try {
    // Utwórz testowego użytkownika
    const hashedPassword = await bcrypt.hash('test123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        username: 'testuser',
        role: 'USER',
        preferences: {
          create: {
            theme: 'light',
            language: 'en',
            notifications: true
          }
        }
      }
    });

    // Utwórz testowego artystę
    const artist = await prisma.artist.create({
      data: {
        name: 'Test Artist',
        description: 'Test artist description'
      }
    });

    // Utwórz testową piosenkę
    const song = await prisma.song.create({
      data: {
        title: 'Test Song',
        artistId: artist.id,
        lyrics: {
          create: {
            content: 'Test lyrics content',
            timestamps: []
          }
        }
      }
    });

    // Utwórz testowe tagi
    const tags = await Promise.all([
      prisma.tag.create({ data: { name: 'rock' } }),
      prisma.tag.create({ data: { name: 'pop' } })
    ]);

    // Przypisz tagi do piosenki
    await Promise.all(
      tags.map(tag =>
        prisma.songTag.create({
          data: {
            songId: song.id,
            tagId: tag.id
          }
        })
      )
    );

    console.log('Test database seeded successfully');
  } catch (error) {
    console.error('Error seeding test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedTestDatabase(); 