import { PrismaClient } from "@prisma/client";

// Ensure environment variables are loaded
if (!process.env.DATABASE_URL) {
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv might not be available or needed in some environments
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
