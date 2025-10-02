import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function isUrlInHistory(url: string): Promise<boolean> {
  const count = await prisma.processedUrl.count({
    where: { url }
  });
  return count > 0;
}
