const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const groups = await prisma.chitGroup.findMany();
  for (const group of groups) {
    const groupId = group.id;
    const memberships = await prisma.groupMember.findMany({ where: { groupId }, include: { user: true } });
    const auctions = await prisma.auction.findMany({ where: { groupId } });
    
    const groupMembers = memberships.map(m => {
      const liftedMonths = auctions
        .filter(a => a.winnerMembershipId === m.id || (!a.winnerMembershipId && a.winnerId === m.userId))
        .map(a => a.month);
      return {
        name: m.customName || m.user.name,
        liftedMonths
      };
    });
    console.log(`Group: ${group.name} - Members:`, groupMembers);
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());
