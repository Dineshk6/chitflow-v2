import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUserId(req: Request): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const fromSession = (session?.user as { id?: string } | undefined)?.id;
  if (fromSession) return fromSession;

  const token = await getToken({
    req: req as never,
    secret: process.env.NEXTAUTH_SECRET,
  });
  return (token?.id as string) ?? null;
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, markAll, clearAll } = await req.json();

    if (clearAll) {
      const result = await prisma.notification.deleteMany({
        where: { userId },
      });
      return NextResponse.json({
        message: "All messages cleared",
        count: result.count,
      });
    }

    if (markAll) {
      const result = await prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      });
      return NextResponse.json({
        message: "All marked as read",
        count: result.count,
      });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification id is required" }, { status: 400 });
    }

    const existing = await prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ message: "Marked as read" });
  } catch (error) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
