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

    const { groupId, userId } = await req.json();

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: { userId, groupId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "User is already a member of this group" }, { status: 400 });
    }

    const membership = await prisma.groupMember.create({
      data: {
        groupId,
        userId,
        status: "ACTIVE" // Admins add members directly as ACTIVE
      }
    });

    return NextResponse.json({ message: "Member added to group successfully!", membership });
  } catch (error: any) {
    console.error("Add group member error:", error);
    return NextResponse.json({ error: "Failed to add member to group" }, { status: 500 });
  }
}
