import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminId = (session.user as { id: string }).id;
    const { groupId, month } = await req.json();
    const monthNum = Number(month);

    if (!groupId || !Number.isInteger(monthNum) || monthNum < 1) {
      return NextResponse.json({ error: 'Group and month are required' }, { status: 400 });
    }

    const group = await prisma.chitGroup.findFirst({
      where: { id: groupId, adminId },
      select: { id: true, name: true, monthlyContribution: true },
    });
    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const memberships = await prisma.groupMember.findMany({
      where: { groupId, status: 'ACTIVE' },
      select: { id: true, userId: true, user: { select: { name: true } } },
    });

    const payments = await prisma.payment.findMany({
      where: { groupId, month: monthNum, status: 'PAID' },
      select: { userId: true, membershipId: true },
    });

    const paidMembershipIds = new Set(payments.map((p) => p.membershipId).filter(Boolean));
    const paidUserIds = new Set(payments.filter((p) => !p.membershipId).map((p) => p.userId));

    const unpaid = memberships.filter((m) => {
      if (paidMembershipIds.has(m.id)) return false;
      const sameUser = memberships.filter((x) => x.userId === m.userId);
      if (sameUser.length === 1 && paidUserIds.has(m.userId)) return false;
      return true;
    });

    if (unpaid.length === 0) {
      return NextResponse.json({ recipientCount: 0, message: 'Everyone has paid this month' });
    }

    const amount = `₹${Math.round(group.monthlyContribution || 0).toLocaleString('en-IN')}`;
    await prisma.notification.createMany({
      data: unpaid.map((m) => ({
        userId: m.userId,
        title: `Payment due · ${group.name}`,
        message: `Month ${monthNum} of ${group.name} is still pending (${amount}). Please pay your agent.`,
        type: 'warning',
      })),
    });

    return NextResponse.json({
      recipientCount: unpaid.length,
      message: `Reminder sent to ${unpaid.length} member(s)`,
    });
  } catch (error) {
    console.error('Remind unpaid error:', error);
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
  }
}
