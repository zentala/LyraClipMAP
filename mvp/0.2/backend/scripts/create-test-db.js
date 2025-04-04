const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.test' });

const prisma = new PrismaClient();

async function createTestDatabase() {
  try {
    // Sprawdź czy baza danych już istnieje
    const result = await prisma.$queryRaw`
      SELECT 1 FROM pg_database WHERE datname = 'lyraclipmap_test'
    `;

    if (result.length === 0) {
      // Utwórz bazę danych
      await prisma.$executeRaw`CREATE DATABASE lyraclipmap_test`;
      console.log('Test database created successfully');
    } else {
      console.log('Test database already exists');
    }

    // Uruchom migracje na bazie testowej
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('Migrations applied successfully');

  } catch (error) {
    console.error('Error creating test database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createTestDatabase(); 