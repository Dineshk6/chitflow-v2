import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, groupId, chitCount = 1 } = await req.json();

    if (!name || !phone || !groupId) {
      return NextResponse.json({ error: "Name, phone number, and Group ID are required" }, { status: 400 });
    }

    const normalizedPhone = phone.trim();

    // Check if the user already exists in the system
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { mobile: normalizedPhone }
        ]
      }
    });

    if (!user) {
      // Create a brand new member profile with dynamic placeholders
      const uniqueId = Math.random().toString(36).substring(2, 11) + "-" + Date.now();
      const defaultPassword = "MemberPassword123!";
      const hashedPassword = await bcrypt.hash(defaultPassword, 12);

      user = await prisma.user.create({
        data: {
          name,
          phone: normalizedPhone,
          mobile: normalizedPhone,
          email: `member-${uniqueId}@chitflow.com`,
          password: hashedPassword,
          role: "MEMBER",
        }
      });
    }

    // Validate against group membersLimit
    const group = await prisma.chitGroup.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const countToAdd = Math.max(1, Number(chitCount) || 1);

    const totalGroupMembers = await prisma.groupMember.count({
      where: { groupId }
    });

    if (totalGroupMembers + countToAdd > (group.membersLimit || group.duration || 20)) {
      return NextResponse.json({ error: `Cannot add more members. Group limit of ${group.membersLimit} reached.` }, { status: 400 });
    }

    // Count existing chits for this user in this group
    const existingCount = await prisma.groupMember.count({
      where: { userId: user.id, groupId }
    });

    const createdMemberships = [];

    for (let i = 0; i < countToAdd; i++) {
      const ticketNum = existingCount + i + 1;
      const customLabel = (existingCount > 0 || countToAdd > 1) 
        ? `${user.name} (Chit #${ticketNum})`
        : user.name.trim();

      const membership = await prisma.groupMember.create({
        data: {
          userId: user.id,
          groupId: groupId,
          status: "ACTIVE",
          customName: customLabel,
        }
      });
      createdMemberships.push(membership);
    }

    return NextResponse.json({ 
      message: `${countToAdd} chit(s) added for member successfully!`, 
      user: { id: user.id, name: user.name, phone: user.phone },
      memberships: createdMemberships
    });
  } catch (error: any) {
    console.error("Admin group member onboarding error:", error);
    return NextResponse.json({ error: error.message || "Failed to add member to group" }, { status: 500 });
  }
}
