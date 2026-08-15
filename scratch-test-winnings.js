const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({ include: { memberships: true, winnings: true } });
  console.log("Users and Winnings:", JSON.stringify(users.map(u => ({
    name: u.name,
    memberships: u.memberships.map(m => m.groupId),
    winnings: u.winnings.map(w => ({ groupId: w.groupId, month: w.month }))
  })), null, 2));

  const groups = await prisma.chitGroup.findMany();
  for (const g of groups) {
    const auctions = await prisma.auction.findMany({ where: { groupId: g.id } });
    console.log(`Group ${g.name} Auctions:`, auctions.map(a => ({
      month: a.month,
      winnerId: a.winnerId,
      winnerMembershipId: a.winnerMembershipId
    })));
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
