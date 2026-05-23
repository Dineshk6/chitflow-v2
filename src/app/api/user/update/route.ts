import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone } = await req.json();

    const updateData: any = { name };
    if (phone !== undefined) {
      updateData.phone = phone;
      updateData.mobile = phone;
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    });

    return NextResponse.json({ 
      message: "Profile updated successfully!", 
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      } 
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
