import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET members inside a specific ChitGroup along with their payments and won auctions (lifts)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    // Find all memberships for this group
    const memberships = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            mobile: true,
            createdAt: true,
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    // Fetch payments for this group
    const payments = await prisma.payment.findMany({
      where: { groupId }
    });

    // Fetch auctions (lifts) for this group
    const auctions = await prisma.auction.findMany({
      where: { groupId }
    });

    // Format the response: combine user data with their payments and lift details
    const groupMembers = memberships.map(m => {
      const userPayments = payments
        .filter(p => p.userId === m.userId)
        .map(p => ({
          id: p.id,
          month: p.month,
          status: p.status,
          amount: p.amount
        }));

      // Find which months this member lifted the chit
      const liftedMonths = auctions
        .filter(a => a.winnerId === m.userId)
        .map(a => a.month);

      const lifts = auctions
        .filter(a => a.winnerId === m.userId)
        .map(a => ({
          month: a.month,
          prizeValue: a.prizeValue || 0,
          winningBid: a.winningBid || 0,
          dividend: a.dividend || 0
        }));

      return {
        ...m.user,
        name: m.customName || m.user.name,
        customName: m.customName,
        membershipId: m.id,
        payments: userPayments,
        liftedMonths,
        lifts
      };
    });

    return NextResponse.json(groupMembers);
  } catch (error: any) {
    console.error("Admin customers fetch error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch customers" }, { status: 500 });
  }
}

// PATCH update payment status, custom due amount, chit lift winner, or custom member name
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { userId, groupId, month, status, amount, winnerId, name, phone, membershipId, payments, prizeValue, winningBid, dividend } = body;

    // CASE 3: Updating membership customName (edit name) and User phone
    if (name !== undefined || phone !== undefined) {
      if (!membershipId && (!userId || !groupId)) {
        return NextResponse.json({ error: "Missing membershipId or userId/groupId" }, { status: 400 });
      }

      let membership;
      
      // Update customName on GroupMember if name is provided
      if (name !== undefined) {
        membership = await prisma.groupMember.update({
          where: membershipId 
            ? { id: membershipId } 
            : { userId_groupId: { userId, groupId } },
          data: {
            customName: name.trim() || null
          }
        });
      }

      // Update phone on User if phone is provided
      if (phone !== undefined) {
        const targetUserId = userId || (membershipId ? (await prisma.groupMember.findUnique({ where: { id: membershipId } }))?.userId : null);
        if (targetUserId) {
          await prisma.user.update({
            where: { id: targetUserId },
            data: { phone: phone.trim() || null }
          });
        }
      }

      return NextResponse.json({ message: "Member details updated successfully!", membership });
    }

    if (!groupId || month === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // CASE 4: Batch updating payments (for applying dividend to all non-winners)
    if (payments !== undefined && Array.isArray(payments)) {
      const targetMonth = Number(month);
      const results = [];
      for (const p of payments) {
        const { userId: paymentUserId, amount: paymentAmount, status: paymentStatus } = p;
        const existingPayment = await prisma.payment.findFirst({
          where: {
            userId: paymentUserId,
            groupId,
            month: targetMonth
          }
        });
        let payment;
        if (existingPayment) {
          payment = await prisma.payment.update({
            where: { id: existingPayment.id },
            data: {
              amount: Number(paymentAmount),
              status: (paymentStatus || existingPayment.status) as any
            }
          });
        } else {
          payment = await prisma.payment.create({
            data: {
              userId: paymentUserId,
              groupId,
              month: targetMonth,
              amount: Number(paymentAmount),
              status: (paymentStatus || 'PENDING') as any
            }
          });
        }
        results.push(payment);
      }
      return NextResponse.json({ message: "Batch payments updated successfully!", results });
    }

    // CASE 1: Updating the Chit Lift winner for the month
    if (winnerId !== undefined) {
      const targetMonth = Number(month);
      
      // Find if an auction record already exists for this group and month
      const existingAuction = await prisma.auction.findFirst({
        where: {
          groupId,
          month: targetMonth
        }
      });

      let auction;
      const winnerVal = winnerId === "none" || !winnerId ? null : winnerId;

      if (winnerVal) {
        const alreadyWon = await prisma.auction.findFirst({
          where: {
            groupId,
            winnerId: winnerVal,
            status: "CLOSED",
            month: { not: targetMonth }
          }
        });

        if (alreadyWon) {
          return NextResponse.json({ error: "This member has already won/lifted the chit in another month!" }, { status: 400 });
        }
      }

      const pVal = prizeValue !== undefined ? Number(prizeValue) : 0;
      const wBid = winningBid !== undefined ? Number(winningBid) : 0;
      const divVal = dividend !== undefined ? Number(dividend) : 0;

      if (existingAuction) {
        auction = await prisma.auction.update({
          where: { id: existingAuction.id },
          data: {
            winnerId: winnerVal,
            prizeValue: winnerVal ? pVal : 0,
            winningBid: winnerVal ? wBid : 0,
            dividend: winnerVal ? divVal : 0
          }
        });
      } else {
        auction = await prisma.auction.create({
          data: {
            groupId,
            month: targetMonth,
            winnerId: winnerVal,
            prizeValue: winnerVal ? pVal : 0,
            winningBid: winnerVal ? wBid : 0,
            dividend: winnerVal ? divVal : 0,
            status: "CLOSED"
          }
        });
      }
      return NextResponse.json({ message: "Chit lift winner updated successfully!", auction });
    }

    // CASE 2: Updating payment status/amount
    if (!userId || !status) {
      return NextResponse.json({ error: "Missing userId or status for payment update" }, { status: 400 });
    }

    // Find if a payment already exists
    const existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
        groupId,
        month: Number(month)
      }
    });

    let payment;
    const paymentAmount = amount !== undefined ? Number(amount) : 5000;

    if (existingPayment) {
      payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: status as any,
          amount: paymentAmount
        }
      });
    } else {
      payment = await prisma.payment.create({
        data: {
          userId,
          groupId,
          month: Number(month),
          status: status as any,
          amount: paymentAmount
        }
      });
    }

    return NextResponse.json({ message: "Payment updated successfully!", payment });
  } catch (error: any) {
    console.error("Admin PATCH error:", error);
    return NextResponse.json({ error: error.message || "Failed to update record" }, { status: 500 });
  }
}

// DELETE a member's association with a specific ChitGroup
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const groupId = searchParams.get("groupId");

    if (!userId || !groupId) {
      return NextResponse.json({ error: "User ID and Group ID are required" }, { status: 400 });
    }

    // Delete membership linking this user to this specific group
    await prisma.groupMember.deleteMany({
      where: {
        userId,
        groupId
      }
    });

    // Delete payments associated with this user inside this group
    await prisma.payment.deleteMany({
      where: {
        userId,
        groupId
      }
    });

    return NextResponse.json({ message: "Member removed from group successfully!" });
  } catch (error: any) {
    console.error("Admin group member deletion error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove member from group" }, { status: 500 });
  }
}
