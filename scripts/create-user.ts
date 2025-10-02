import { hash } from "bcryptjs";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error("Usage: npm run create-user <username> <password>");
    process.exit(1);
  }

  try {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash: hashedPassword,
      },
    });

    console.log(`User created successfully: ${user.username}`);
  } catch (error) {
    console.error("Failed to create user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
