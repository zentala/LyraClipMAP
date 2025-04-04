// Konfiguracja środowiska testowego
require('dotenv').config({ path: '.env.test' });

// Mock bcrypt dla wszystkich testów
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Zwiększamy timeout dla operacji bazodanowych
jest.setTimeout(30000);

// Wyłączamy logi podczas testów
process.env.LOG_LEVEL = 'error';

// Funkcja pomocnicza do czyszczenia bazy danych
global.clearDatabase = async (prisma) => {
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
  for (const table of tables) {
    await prisma.$executeRaw`TRUNCATE TABLE "${table}" CASCADE;`;
  }
}; 