import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: memberId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Member notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { memberId, message, title, groupId } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const member = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, name: true, phone: true, role: true },
    });

    if (!member || member.role !== "MEMBER") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const memberships = await prisma.groupMember.findMany({
      where: {
        userId: memberId,
        status: "ACTIVE",
        ...(groupId ? { groupId } : {}),
      },
      include: {
        group: { select: { id: true, name: true, adminId: true } },
      },
    });

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: groupId ? "You are not in this group" : "You are not in any active group" },
        { status: 400 }
      );
    }

    const adminIds = [...new Set(memberships.map((m) => m.group.adminId))];
    const groupNames = memberships.map((m) => m.group.name).join(", ");
    const defaultTitle = `Message from ${member.name}`;
    const body = groupId
      ? message.trim()
      : `${message.trim()}\n\n— Groups: ${groupNames}`;

    await prisma.notification.createMany({
      data: adminIds.map((adminUserId) => ({
        userId: adminUserId,
        title: (title?.trim() || defaultTitle).slice(0, 120),
        message: body.slice(0, 500),
        type: "member_message",
      })),
    });

    return NextResponse.json({
      message: "Message sent to your agent",
      sentTo: adminIds.length,
    });
  } catch (error) {
    console.error("Member send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { memberId, id, markAll, clearAll } = await req.json();

    if (!memberId) {
      return NextResponse.json({ error: "memberId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: memberId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "MEMBER") {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (clearAll) {
      const result = await prisma.notification.deleteMany({
        where: { userId: memberId },
      });
      return NextResponse.json({
        message: "All messages cleared",
        count: result.count,
      });
    }

    if (markAll) {
      const result = await prisma.notification.updateMany({
        where: { userId: memberId },
        data: { read: true },
      });
      return NextResponse.json({
        message: "All marked as read",
        count: result.count,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: { id, userId: memberId },
      data: { read: true },
    });

    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    console.error("Member notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
