import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Get groups where user is a member
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      include: { group: true }
    });

    // 2. Calculate total investment (paid payments)
    const totalInvestmentAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { 
        userId,
        status: "PAID"
      }
    });

    // 3. Calculate total dividend earned (dividend flow is disabled)
    const totalDividend = 0;

    const activeGroups = memberships.map((m: any) => {
      const group = m.group;
      const progress = Math.floor((group.currentMonth / group.duration) * 100);
      return {
        id: group.id,
        name: group.name,
        monthlyContribution: group.monthlyContribution,
        status: group.status,
        duration: group.duration,
        currentMonth: group.currentMonth,
        progress: progress
      };
    });

    // 4. Get pending payments
    const pendingPayments = await prisma.payment.findMany({
      where: { 
        userId,
        status: "PENDING"
      },
      include: { group: true },
      orderBy: { createdAt: 'desc' }
    });

    const totalDue = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      activeGroupsCount: activeGroups.length,
      totalInvestment: totalInvestmentAgg._sum.amount || 0,
      totalDue,
      totalDividend: totalDividend,
      activeGroups: activeGroups, 
      pendingPayments: pendingPayments,
      recentPayments: [],
    });
  } catch (error) {
    console.error("Customer stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
