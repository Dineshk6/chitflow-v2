const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create or update the Admin (Agent) user
  const adminEmail = "dineshnayak1@gmail.com";
  const hashedPassword = await bcrypt.hash("password123", 10);

  let admin = await prisma.user.findFirst({
    where: { email: { equals: adminEmail, mode: "insensitive" } }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        name: "Dinesh Nayak (Agent)",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        phone: "9900990099",
        kycStatus: "verified"
      }
    });
    console.log(`✅ Created Admin (Agent): ${adminEmail}`);
  } else {
    admin = await prisma.user.update({
      where: { id: admin.id },
      data: {
        role: "ADMIN",
        password: hashedPassword // Reset to password123 for testing
      }
    });
    console.log(`✅ Updated existing Admin (Agent) to role: ADMIN, password: password123`);
  }

  // 2. Create a dummy Chit Group under this admin
  const groupName = "Super Gold Chit 100K";
  let group = await prisma.chitGroup.findFirst({
    where: { name: groupName, adminId: admin.id }
  });

  if (!group) {
    group = await prisma.chitGroup.create({
      data: {
        name: groupName,
        totalAmount: 100000,
        monthlyContribution: 10000,
        liftedContribution: 8000,
        duration: 10,
        membersLimit: 10,
        currentMonth: 3,
        startDate: new Date("2026-01-01"),
        status: "ACTIVE",
        adminId: admin.id
      }
    });
    console.log(`✅ Created Chit Group: ${groupName}`);
  } else {
    group = await prisma.chitGroup.update({
      where: { id: group.id },
      data: {
        currentMonth: 3,
        status: "ACTIVE"
      }
    });
    console.log(`✅ Found and updated existing Chit Group: ${groupName}`);
  }

  // 3. Create dummy Member users
  const dummyMembers = [
    { name: "Nikhil Sharma", email: "nikhil@example.com", phone: "9876543210" },
    { name: "Aisha Khan", email: "aisha@example.com", phone: "9876543211" },
    { name: "Rohan Verma", email: "rohan@example.com", phone: "9876543212" },
    { name: "Divya Nair", email: "divya@example.com", phone: "9876543213" },
    { name: "Dinesh", email: "dineshmember@example.com", phone: "9876543214" }
  ];

  const createdMembers = [];

  for (const m of dummyMembers) {
    let memberUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: m.email },
          { phone: m.phone }
        ]
      }
    });

    if (!memberUser) {
      memberUser = await prisma.user.create({
        data: {
          name: m.name,
          email: m.email,
          phone: m.phone,
          password: hashedPassword, // password123
          role: "MEMBER",
          kycStatus: "verified"
        }
      });
      console.log(`👤 Created Member User: ${m.name}`);
    } else {
      memberUser = await prisma.user.update({
        where: { id: memberUser.id },
        data: {
          name: m.name
        }
      });
      console.log(`👤 Updated Member User name to: ${m.name}`);
    }
    createdMembers.push(memberUser);

    // Link member to group if not already linked
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: memberUser.id,
          groupId: group.id
        }
      }
    });

    if (!existingMembership) {
      await prisma.groupMember.create({
        data: {
          userId: memberUser.id,
          groupId: group.id,
          status: "ACTIVE"
        }
      });
      console.log(`🔗 Linked ${m.name} to group ${groupName}`);
    }
  }

  // 4. Create past Auction (winner) records for months 1 & 2
  // Month 1 Auction (Nikhil won)
  const auction1 = await prisma.auction.findFirst({
    where: { groupId: group.id, month: 1 }
  });
  if (!auction1) {
    await prisma.auction.create({
      data: {
        groupId: group.id,
        month: 1,
        winnerId: createdMembers[0].id, // Nikhil
        winningBid: 15000,
        prizeValue: 85000,
        dividend: 1500,
        status: "CLOSED"
      }
    });
    console.log("🏆 Created Month 1 Auction Winner record");
  }

  // Month 2 Auction (Aisha won)
  const auction2 = await prisma.auction.findFirst({
    where: { groupId: group.id, month: 2 }
  });
  if (!auction2) {
    await prisma.auction.create({
      data: {
        groupId: group.id,
        month: 2,
        winnerId: createdMembers[1].id, // Aisha
        winningBid: 12000,
        prizeValue: 88000,
        dividend: 1200,
        status: "CLOSED"
      }
    });
    console.log("🏆 Created Month 2 Auction Winner record");
  }

  // 5. Generate Payment history
  // Month 1 Payments (all paid)
  for (const member of createdMembers) {
    const existingPayment = await prisma.payment.findFirst({
      where: { groupId: group.id, userId: member.id, month: 1 }
    });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          groupId: group.id,
          userId: member.id,
          month: 1,
          amount: 8500, // 10000 - 1500 dividend
          status: "PAID"
        }
      });
    }
  }

  // Month 2 Payments (some paid, some pending)
  for (let i = 0; i < createdMembers.length; i++) {
    const member = createdMembers[i];
    const existingPayment = await prisma.payment.findFirst({
      where: { groupId: group.id, userId: member.id, month: 2 }
    });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          groupId: group.id,
          userId: member.id,
          month: 2,
          amount: 8800, // 10000 - 1200 dividend
          status: (i === 1 || i === 4) ? "PAID" : "PENDING" // Aisha & Dinesh Member paid, others pending
        }
      });
    }
  }

  // Month 3 Payments (all pending)
  for (const member of createdMembers) {
    const existingPayment = await prisma.payment.findFirst({
      where: { groupId: group.id, userId: member.id, month: 3 }
    });
    if (!existingPayment) {
      await prisma.payment.create({
        data: {
          groupId: group.id,
          userId: member.id,
          month: 3,
          amount: 10000, // No dividend yet for active month
          status: "PENDING"
        }
      });
    }
  }

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
