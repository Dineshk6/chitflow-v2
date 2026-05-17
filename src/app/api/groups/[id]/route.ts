import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.chitGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        auctions: {
          include: {
            bids: {
              include: {
                user: { select: { id: true, name: true } }
              },
              orderBy: { amount: 'desc' }
            }
          }
        },
        payments: {
          include: {
            user: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error("Fetch group error:", error);
    return NextResponse.json({ error: "Failed to fetch group details" }, { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = {
      name: body.name,
      totalAmount: body.totalAmount ? parseFloat(body.totalAmount) : undefined,
      membersLimit: body.membersLimit ? parseInt(body.membersLimit) : undefined,
      status: body.status,
    };

    if (body.monthlyContribution !== undefined) {
      dataToUpdate.monthlyContribution = parseFloat(body.monthlyContribution);
    }
    if (body.liftedContribution !== undefined) {
      dataToUpdate.liftedContribution = body.liftedContribution !== null ? parseFloat(body.liftedContribution) : null;
    }

    const updatedGroup = await prisma.chitGroup.update({
      where: { id },
      data: dataToUpdate
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update group" }, { status: 500 });
  }
}
