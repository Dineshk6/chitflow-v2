import { PrismaClient } from '@prisma/client';

async function createTestGroup() {
  const prisma = new PrismaClient();
  try {
    console.log('Attempting to create a test group manually...');
    
    // Find an admin user first
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('❌ Error: No admin user found in database. Please register an admin first.');
      return;
    }

    const group = await prisma.chitGroup.create({
      data: {
        name: "Test Group " + Date.now(),
        totalAmount: 100000,
        membersLimit: 20,
        duration: 20,
        monthlyContribution: 5000,
        status: "UPCOMING",
        adminId: admin.id
      }
    });

    console.log('✅ Success: Group created with ID:', group.id);
  } catch (error: any) {
    console.error('❌ Error creating group:', error.message);
    if (error.code) console.error('Error Code:', error.code);
  } finally {
    await prisma.$disconnect();
  }
}

createTestGroup();
