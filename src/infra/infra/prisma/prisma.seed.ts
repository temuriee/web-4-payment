import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { plans } from './data';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
  }),
});

async function main() {
  try {
    console.log('Seeding database');

    // Clear existing data
    await prisma.plan.deleteMany();

    // Seed plans data
    await prisma.plan.createMany({
      data: plans,
    });

    console.log('Seeding finished');
  } catch (error) {
    console.log(error);
    throw new Error('Failed to seed the database');
  } finally {
    await prisma.$disconnect();
  }
}

main();
