import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json({ error: "User ID and status are required" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: status }
    });

    return NextResponse.json({ message: `KYC status updated to ${status}`, user: updatedUser });
  } catch (error) {
    console.error("KYC update error:", error);
    return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 });
  }
}
