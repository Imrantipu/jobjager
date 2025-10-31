// Test setup file
import { PrismaClient } from '@prisma/client';

// Extend Jest timeout for database operations
jest.setTimeout(10000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Setup test database client
export const prisma = new PrismaClient();

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
