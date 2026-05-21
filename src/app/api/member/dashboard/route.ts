import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('memberId');

    if (!memberId) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    // Get all groups this member belongs to, with payments
    const memberships = await prisma.groupMember.findMany({
      where: { userId: memberId } as any,
      include: {
        group: {
          select: {
            id: true,
            name: true,
            totalAmount: true,
            monthlyContribution: true,
            liftedContribution: true,
            duration: true,
            membersLimit: true,
            status: true,
            _count: { select: { members: true } }
          }
        }
      }
    } as any);

    // Get payments for each group
    const groupData = await Promise.all(
      memberships.map(async (membership: any) => {
        const payments = await prisma.payment.findMany({
          where: { userId: memberId, groupId: membership.groupId } as any,
          orderBy: { month: 'asc' } as any
        });

        // Get who won which month
        const auctions = await prisma.auction.findMany({
          where: { groupId: membership.groupId } as any,
          select: { month: true, winnerId: true }
        } as any);

        const myWins = auctions
          .filter((a: any) => a.winnerId === memberId)
          .map((a: any) => a.month);

        const paidPayments = payments.filter((p: { status: string }) => p.status === 'PAID');
        const paidCount = new Set(paidPayments.map((p: { month: number }) => p.month)).size;
        const totalPaid = paidPayments.reduce((sum: number, p: { amount?: number }) => sum + (p.amount || 0), 0);
        const duration = membership.group.duration ?? 0;

        return {
          group: membership.group,
          payments,
          myWins,
          paidCount,
          totalPaid,
          pendingMonths: Math.max(0, duration - paidCount),
        };
      })
    );

    return NextResponse.json(groupData);
  } catch (error) {
    console.error('Member dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load member data' }, { status: 500 });
  }
}
