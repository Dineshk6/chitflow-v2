import { PrismaClient } from '@prisma/client';

async function checkUser() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'katravath546@gmail.com' }
    });

    if (user) {
      console.log('✅ User Found:');
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
    } else {
      console.log('❌ User not found with email: katravath546@gmail.com');
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
