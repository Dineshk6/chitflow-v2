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

    const { membershipId } = await req.json();

    const updatedMembership = await prisma.groupMember.update({
      where: { id: membershipId },
      data: { status: "ACTIVE" }
    });

    return NextResponse.json({ message: "Member approved successfully!", membership: updatedMembership });
  } catch (error) {
    console.error("Approval error:", error);
    return NextResponse.json({ error: "Failed to approve member" }, { status: 500 });
  }
}
