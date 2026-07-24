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

    const { groupId, userId, chitCount = 1 } = await req.json();

    if (!groupId || !userId) {
      return NextResponse.json({ error: "Missing required IDs" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch the group to check membersLimit
    const group = await prisma.chitGroup.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const countToAdd = Math.max(1, Number(chitCount) || 1);

    // Validate against group membersLimit
    const totalGroupMembers = await prisma.groupMember.count({
      where: { groupId }
    });

    if (totalGroupMembers + countToAdd > (group.membersLimit || group.duration || 20)) {
      return NextResponse.json({ error: `Cannot add more members. Group limit of ${group.membersLimit} reached.` }, { status: 400 });
    }

    // Count how many existing chits this user already has in this group
    const existingCount = await prisma.groupMember.count({
      where: { userId, groupId }
    });

    const countToAdd = Math.max(1, Number(chitCount) || 1);
    const createdMemberships = [];

    for (let i = 0; i < countToAdd; i++) {
      const ticketNum = existingCount + i + 1;
      const customLabel = (existingCount > 0 || countToAdd > 1) 
        ? `${user.name} (Chit #${ticketNum})`
        : null;

      const membership = await prisma.groupMember.create({
        data: {
          groupId,
          userId,
          customName: customLabel,
          status: "ACTIVE"
        }
      });
      createdMemberships.push(membership);
    }

    return NextResponse.json({
      message: `${countToAdd} chit(s) added for ${user.name} successfully!`,
      memberships: createdMemberships
    });
  } catch (error: any) {
    console.error("Add group member error:", error);
    return NextResponse.json({ error: "Failed to add member to group" }, { status: 500 });
  }
}
