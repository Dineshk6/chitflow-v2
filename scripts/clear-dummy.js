const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting database cleanup...");

  try {
    // 1. Delete all notifications first (users relate to them)
    const notificationsDelete = await prisma.notification.deleteMany({});
    console.log(`🗑️ Deleted ${notificationsDelete.count} notifications.`);

    // 2. Delete all payments
    const paymentsDelete = await prisma.payment.deleteMany({});
    console.log(`🗑️ Deleted ${paymentsDelete.count} payments.`);

    // 3. Delete all bids
    const bidsDelete = await prisma.bid.deleteMany({});
    console.log(`🗑️ Deleted ${bidsDelete.count} bids.`);

    // 4. Delete all auctions/winners
    const auctionsDelete = await prisma.auction.deleteMany({});
    console.log(`🗑️ Deleted ${auctionsDelete.count} auctions.`);

    // 5. Delete all group memberships
    const membershipsDelete = await prisma.groupMember.deleteMany({});
    console.log(`🗑️ Deleted ${membershipsDelete.count} memberships.`);

    // 6. Delete all chit groups
    const groupsDelete = await prisma.chitGroup.deleteMany({});
    console.log(`🗑️ Deleted ${groupsDelete.count} chit groups.`);

    // 7. Delete all member users
    const membersDelete = await prisma.user.deleteMany({
      where: {
        role: 'MEMBER'
      }
    });
    console.log(`🗑️ Deleted ${membersDelete.count} member accounts.`);

    console.log("✨ Database cleanup completed successfully!");
  } catch (error) {
    console.error("❌ Error running cleanup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
