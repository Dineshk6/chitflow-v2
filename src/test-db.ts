import { PrismaClient } from '@prisma/client';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to connect to MongoDB...');
    await prisma.$connect();
    console.log('✅ Success: Connected to MongoDB Atlas.');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Current User Count: ${userCount}`);
    
  } catch (error: any) {
    console.error('❌ Error: Could not connect to MongoDB.');
    console.error('Reason:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
