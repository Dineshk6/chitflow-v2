import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET groups - only return groups belonging to the logged-in admin
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.chitGroup.findMany({
      where: { adminId: session.user.id } as any,
      include: {
        _count: { select: { members: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST create a new group
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Double check the database for the LATEST role (bypasses session caching)
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      console.log("Creation blocked: User is not an ADMIN in database.", { email: session.user.email, role: dbUser?.role });
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    console.log("Creating group with body:", body);

    const { 
      name, 
      totalValue,
      membersLimit, 
      durationMonths,
      monthlyContribution,
      liftedContribution,
      startDate,
      calculationType,
      startBid,
      commissionPct,
      manualSchedule,
    } = body;

    // Validation
    if (!name || !totalValue || !membersLimit || !durationMonths || monthlyContribution === undefined || monthlyContribution === null || monthlyContribution === '') {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const totalAmountNum = parseFloat(totalValue);
    const membersLimitNum = parseInt(membersLimit);
    const durationNum = parseInt(durationMonths);
    const monthlyContributionNum = parseFloat(monthlyContribution);
    const liftedContributionNum = liftedContribution ? parseFloat(liftedContribution) : null;
    const startBidNum = startBid ? parseFloat(startBid) : null;
    const commissionPctNum = commissionPct !== undefined && commissionPct !== null ? parseFloat(commissionPct) : 5.0;
    const calculationTypeStr = calculationType || "VARIATION_1";
    const manualScheduleData =
      calculationTypeStr === 'MANUAL' && Array.isArray(manualSchedule) ? manualSchedule : null;

    if (isNaN(totalAmountNum) || isNaN(membersLimitNum) || isNaN(durationNum) || isNaN(monthlyContributionNum)) {
      return NextResponse.json({ error: "Invalid numeric values" }, { status: 400 });
    }

    const group = await prisma.chitGroup.create({
      data: {
        name,
        totalAmount: totalAmountNum,
        membersLimit: membersLimitNum,
        duration: durationNum,
        monthlyContribution: monthlyContributionNum,
        liftedContribution: liftedContributionNum,
        calculationType: calculationTypeStr,
        startBid: startBidNum,
        commissionPct: commissionPctNum,
        manualSchedule: manualScheduleData,
        startDate: startDate ? new Date(startDate) : null,
        status: "UPCOMING",
        adminId: session.user.id,
      } as any
    });

    console.log("Group created successfully:", group.id);
    return NextResponse.json(group, { status: 201 });
  } catch (error: any) {
    console.error("Error creating group:", error);
    return NextResponse.json({ error: error.message || "Failed to create group" }, { status: 500 });
  }
}

// PUT update an existing group
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const { 
      id,
      name, 
      totalValue,
      membersLimit, 
      durationMonths,
      monthlyContribution,
      liftedContribution,
      calculationType,
      startBid,
      commissionPct,
      manualSchedule,
    } = body;

    if (!id || !name || !totalValue || !membersLimit || !durationMonths || monthlyContribution === undefined || monthlyContribution === null || monthlyContribution === '') {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const totalAmountNum = parseFloat(totalValue);
    const membersLimitNum = parseInt(membersLimit);
    const durationNum = parseInt(durationMonths);
    const monthlyContributionNum = parseFloat(monthlyContribution);
    const liftedContributionNum = liftedContribution ? parseFloat(liftedContribution) : null;
    const startBidNum = startBid ? parseFloat(startBid) : null;
    const commissionPctNum = commissionPct !== undefined && commissionPct !== null ? parseFloat(commissionPct) : 5.0;
    const calculationTypeStr = calculationType || "VARIATION_1";
    const manualScheduleData =
      calculationTypeStr === 'MANUAL' && Array.isArray(manualSchedule) ? manualSchedule : null;

    if (isNaN(totalAmountNum) || isNaN(membersLimitNum) || isNaN(durationNum) || isNaN(monthlyContributionNum)) {
      return NextResponse.json({ error: "Invalid numeric values" }, { status: 400 });
    }

    const group = await prisma.chitGroup.update({
      where: { id },
      data: {
        name,
        totalAmount: totalAmountNum,
        membersLimit: membersLimitNum,
        duration: durationNum,
        monthlyContribution: monthlyContributionNum,
        liftedContribution: liftedContributionNum,
        calculationType: calculationTypeStr,
        startBid: startBidNum,
        commissionPct: commissionPctNum,
        manualSchedule: manualScheduleData,
      } as any
    });

    console.log("Group updated successfully:", group.id);
    return NextResponse.json(group);
  } catch (error: any) {
    console.error("Error updating group:", error);
    return NextResponse.json({ error: error.message || "Failed to update group" }, { status: 500 });
  }
}

// DELETE a group with cascade deletes
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Find all member IDs in this group
    const groupMembers = await prisma.groupMember.findMany({
      where: { groupId: id },
      select: { userId: true }
    });
    const userIds = groupMembers.map(m => m.userId);

    // Cascade delete user-associated details to prevent orphan records
    await prisma.bid.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.payment.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.groupMember.deleteMany({ where: { userId: { in: userIds } } });

    // Remove winner references to these users in auctions
    await prisma.auction.updateMany({
      where: { winnerId: { in: userIds } },
      data: { winnerId: null }
    });

    // Cascade delete any remaining group-specific details
    await prisma.groupMember.deleteMany({ where: { groupId: id } });
    await prisma.payment.deleteMany({ where: { groupId: id } });
    await prisma.auction.deleteMany({ where: { groupId: id } });

    // Delete the member user accounts (keeping admin accounts intact)
    await prisma.user.deleteMany({
      where: {
        id: { in: userIds },
        role: "MEMBER"
      }
    });

    // Finally delete the group itself
    await prisma.chitGroup.delete({ where: { id } });

    console.log("Group deleted successfully:", id);
    return NextResponse.json({ message: "Group deleted successfully!" });
  } catch (error: any) {
    console.error("Error deleting group:", error);
    return NextResponse.json({ error: error.message || "Failed to delete group" }, { status: 500 });
  }
}
