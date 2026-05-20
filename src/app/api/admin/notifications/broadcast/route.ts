import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = (session.user as { id: string }).id;
    const { groupId, title, message, type = "info" } = await req.json();

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
    }

    const groupFilter =
      groupId && groupId !== "all"
        ? { id: groupId, adminId }
        : { adminId };

    const groups = await prisma.chitGroup.findMany({
      where: groupFilter,
      select: { id: true, name: true },
    });

    if (groups.length === 0) {
      return NextResponse.json({ error: "No groups found" }, { status: 404 });
    }

    const groupIds = groups.map((g) => g.id);

    const members = await prisma.groupMember.findMany({
      where: { groupId: { in: groupIds }, status: "ACTIVE" },
      select: { userId: true },
    });

    const uniqueUserIds = [...new Set(members.map((m) => m.userId))];

    if (uniqueUserIds.length === 0) {
      return NextResponse.json({ error: "No active members in selected group(s)" }, { status: 400 });
    }

    const groupLabel =
      groupId && groupId !== "all"
        ? groups[0]?.name
        : `All groups (${groups.length})`;

    await prisma.notification.createMany({
      data: uniqueUserIds.map((userId) => ({
        userId,
        title: title.trim(),
        message: message.trim(),
        type,
      })),
    });

    return NextResponse.json({
      message: `Broadcast sent to ${uniqueUserIds.length} member(s)`,
      recipientCount: uniqueUserIds.length,
      groupLabel,
    });
  } catch (error) {
    console.error("Broadcast error:", error);
    return NextResponse.json({ error: "Failed to send broadcast" }, { status: 500 });
  }
}
