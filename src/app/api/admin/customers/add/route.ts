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

    const { name, phone, groupId } = await req.json();

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

    // Check if they are already in the group
    const existingMembership = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: groupId
        }
      }
    });

    if (existingMembership) {
      return NextResponse.json({ error: "Member is already registered in this group" }, { status: 400 });
    }

    // Link the member to the group
    const membership = await prisma.groupMember.create({
      data: {
        userId: user.id,
        groupId: groupId,
        status: "ACTIVE"
      }
    });

    return NextResponse.json({ 
      message: "Member added to group successfully!", 
      user: { id: user.id, name: user.name, phone: user.phone },
      membership
    });
  } catch (error: any) {
    console.error("Admin group member onboarding error:", error);
    return NextResponse.json({ error: error.message || "Failed to add member to group" }, { status: 500 });
  }
}
