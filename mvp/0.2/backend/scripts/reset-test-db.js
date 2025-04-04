const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.test' });

const prisma = new PrismaClient();

async function resetTestDatabase() {
  try {
    // Lista tabel do wyczyszczenia
    const tables = [
      'User',
      'UserPreferences',
      'Song',
      'Artist',
      'Lyrics',
      'TextContent',
      'Tag',
      'SongTag',
      'Playlist'
    ];

    // Wyczyść każdą tabelę
    for (const table of tables) {
      await prisma.$executeRaw`TRUNCATE TABLE "${table}" CASCADE;`;
      console.log(`Table ${table} truncated`);
    }

    console.log('Test database reset successfully');
  } catch (error) {
    console.error('Error resetting test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetTestDatabase(); 