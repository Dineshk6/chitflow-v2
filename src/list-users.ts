import { PrismaClient } from '@prisma/client';

async function listUsers() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        mobile: true,
        role: true
      }
    });
    console.log("=== USERS IN DATABASE ===");
    console.log(JSON.stringify(users, null, 2));
  } catch (error: any) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
