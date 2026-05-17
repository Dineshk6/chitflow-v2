import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;

    // Get counts filtered by this admin's groups only
    const totalGroups = await prisma.chitGroup.count({ where: { adminId } as any });
    const activeGroups = await prisma.chitGroup.count({ where: { adminId, status: "ACTIVE" } as any });

    // Get all group IDs belonging to this admin
    const adminGroups = await prisma.chitGroup.findMany({
      where: { adminId } as any,
      select: { id: true }
    });
    const adminGroupIds = adminGroups.map((g: any) => g.id);

    // Count members only in this admin's groups
    const totalMembers = await prisma.groupMember.count({
      where: { groupId: { in: adminGroupIds } }
    });

    // Calculate total revenue from this admin's groups only
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        groupId: { in: adminGroupIds }
      }
    });

    // Get recent groups for this admin only (last 5)
    const recentGroups = await prisma.chitGroup.findMany({
      where: { adminId } as any,
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, createdAt: true, totalAmount: true }
    });

    return NextResponse.json({
      totalGroups,
      activeGroups,
      totalMembers,
      totalRevenue: payments._sum.amount || 0,
      recentGroups,
      growth: {
        revenue: "+12.5%",
        members: "+8.2%"
      }
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
