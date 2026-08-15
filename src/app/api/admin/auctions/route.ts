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

    const { auctionId, status, winnerId } = await req.json();

    if (status === "CLOSED") {
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { group: { include: { members: true } } }
      });

      if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

      let winnerUser: any = null;
      let winningBidAmount = 0;

      if (winnerId) {
        winnerUser = await prisma.user.findUnique({ where: { id: winnerId } });
      } else {
        const highestBid = await prisma.bid.findFirst({
          where: { auctionId },
          orderBy: { amount: 'desc' },
          include: { user: true }
        });
        if (highestBid) {
          winnerUser = highestBid.user;
          winningBidAmount = highestBid.amount;
        }
      }

      if (!winnerUser) {
        return NextResponse.json({ error: "No winner selected and no bids found to close auction" }, { status: 400 });
      }

      // Check if this winner has already won a closed auction in this group!
      const alreadyWon = await prisma.auction.findFirst({
        where: {
          groupId: auction.groupId,
          winnerId: winnerUser.id,
          status: "CLOSED"
        }
      });

      if (alreadyWon) {
        return NextResponse.json({ error: `${winnerUser.name} has already won/lifted a chit in this group` }, { status: 400 });
      }

      // Get all previous winners in this group to apply updated amount (liftedContribution)
      const previousAuctions = await prisma.auction.findMany({
        where: {
          groupId: auction.groupId,
          status: "CLOSED",
          winnerId: { not: null }
        },
        select: {
          winnerId: true
        }
      });
      const previousWinnerIds = new Set(previousAuctions.map(a => a.winnerId).filter(Boolean) as string[]);

      const amountToPayRegular = auction.group.monthlyContribution;
      const calcType = (auction.group as any).calculationType || 'VARIATION_1';
      const manualRows = Array.isArray((auction.group as any).manualSchedule)
        ? (auction.group as any).manualSchedule
        : null;
      const monthEntry = manualRows?.find((r: any) => Number(r.month) === auction.month);
      const monthRegular = monthEntry
        ? Number(monthEntry.regularPay) || amountToPayRegular
        : amountToPayRegular;
      const monthLifted = monthEntry
        ? Number(monthEntry.liftedPay) || monthRegular
        : (auction.group.liftedContribution || amountToPayRegular);

      const paymentOperations = auction.group.members.map(member => {
        const hasWonBefore = previousWinnerIds.has(member.userId);
        
        let amount = monthRegular;
        // Variation 1 / Manual: previous winners pay lifted amount.
        // Variation 2: everyone pays fixed monthly contribution.
        if (calcType === 'VARIATION_1' || calcType === 'MANUAL') {
          if (hasWonBefore) {
            amount = monthLifted;
          }
        } else {
          amount = amountToPayRegular;
        }

        return prisma.payment.create({
          data: {
            userId: member.userId,
            groupId: auction.groupId,
            amount: amount,
            month: auction.month,
            status: "PENDING"
          }
        });
      });

      await prisma.$transaction([
        // Update auction
        prisma.auction.update({
          where: { id: auctionId },
          data: {
            status: "CLOSED",
            winnerId: winnerUser.id,
            winningBid: winningBidAmount,
            dividend: 0,
          }
        }),
        // Increment group month
        prisma.chitGroup.update({
          where: { id: auction.groupId },
          data: { currentMonth: { increment: 1 } }
        }),
        // Create payments for all members
        ...paymentOperations
      ]);

      return NextResponse.json({ message: "Auction closed and payments generated!", winner: winnerUser.name });
    }

    // Otherwise just update status (e.g., to OPEN)
    const updatedAuction = await prisma.auction.update({
      where: { id: auctionId },
      data: { status }
    });

    return NextResponse.json(updatedAuction);
  } catch (error) {
    console.error("Auction management error:", error);
    return NextResponse.json({ error: "Failed to update auction" }, { status: 500 });
  }
}
