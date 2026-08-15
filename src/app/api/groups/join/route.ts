import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await req.json();
    const userId = session.user.id;

    // 1. Check if the group exists and is UPCOMING/ACTIVE
    const group = await prisma.chitGroup.findUnique({
      where: { id: groupId },
      include: { 
        _count: {
          select: { members: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // 2. Check if the group is full
    if (group._count.members >= group.membersLimit) {
      return NextResponse.json({ error: "Group is already full" }, { status: 400 });
    }

    // 3. Check if user is already a member
    const existingMembership = await prisma.groupMember.findFirst({
      where: {
        userId,
        groupId
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: "You are already a member of this group" }, { status: 400 });
    }

    // 4. Create membership (Initially PENDING until Admin approves)
    const membership = await prisma.groupMember.create({
      data: {
        userId,
        groupId,
        status: "PENDING",
      }
    });

    // 5. Notify Admin
    await (prisma as any).notification.create({
      data: {
        userId: group.adminId,
        title: "New Join Request",
        message: `${session.user.name} has requested to join "${group.name}".`,
        type: "info"
      }
    });

    return NextResponse.json({ message: "Successfully joined the group!", membership }, { status: 201 });
  } catch (error) {
    console.error("Join group error:", error);
    return NextResponse.json({ error: "Failed to join group" }, { status: 500 });
  }
}
