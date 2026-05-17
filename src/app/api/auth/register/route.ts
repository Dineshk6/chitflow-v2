import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { name, email, phone, password, role, inviteCode } = body;

    // Normalize email and phone
    email = email?.trim().toLowerCase() || null;
    phone = phone?.trim() || null;

    if (!name || (!email && !phone) || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role === "ADMIN" && inviteCode !== "dineshchits") {
      return NextResponse.json(
        { error: "Invalid Admin Access Code. You are not authorized." },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          phone ? { phone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email or phone already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const uniqueId = Math.random().toString(36).substring(2, 11) + "-" + Date.now();

    const userData: any = {
      name,
      password: hashedPassword,
      role: role === "ADMIN" ? "ADMIN" : "MEMBER",
      email: email || `no-email-${uniqueId}@chitflow.com`,
      phone: phone || `no-phone-${uniqueId}`,
      mobile: phone || `no-phone-${uniqueId}`,
    };

    const user = await prisma.user.create({
      data: userData
    });

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
