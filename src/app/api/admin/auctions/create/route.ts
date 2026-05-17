import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, month, prizeValue } = await req.json();

    if (!groupId || !month || !prizeValue) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if auction already exists for this month
    const existing = await prisma.auction.findFirst({
      where: { groupId, month }
    });

    if (existing) {
      return NextResponse.json({ error: `Auction for month ${month} already exists` }, { status: 400 });
    }

    const auction = await prisma.auction.create({
      data: {
        groupId,
        month: parseInt(month),
        prizeValue: parseFloat(prizeValue),
        status: "UPCOMING",
      }
    });

    // 3. Notify all members
    const group = await prisma.chitGroup.findUnique({ where: { id: groupId } });
    const members = await prisma.groupMember.findMany({
      where: { groupId, status: "ACTIVE" }
    });

    await (prisma as any).notification.createMany({
      data: members.map(m => ({
        userId: m.userId,
        title: "Auction Scheduled",
        message: `A new auction for Month ${month} has been scheduled for "${group?.name}".`,
        type: "auction"
      }))
    });

    return NextResponse.json({ message: "Auction scheduled successfully!", auction });
  } catch (error: any) {
    console.error("Schedule auction error:", error);
    return NextResponse.json({ error: "Failed to schedule auction" }, { status: 500 });
  }
}
