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

    const { auctionId, status } = await req.json();

    if (status === "CLOSED") {
      // 1. Find the highest bid
      const highestBid = await prisma.bid.findFirst({
        where: { auctionId },
        orderBy: { amount: 'desc' },
        include: { user: true }
      });

      if (!highestBid) {
        return NextResponse.json({ error: "No bids found to close auction" }, { status: 400 });
      }

      // 2. Update auction with winner and dividend
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: { group: { include: { members: true } } }
      });

      if (!auction) return NextResponse.json({ error: "Auction not found" }, { status: 404 });

      // Check if this highest bidder has already won a closed auction in this group!
      const alreadyWon = await prisma.auction.findFirst({
        where: {
          groupId: auction.groupId,
          winnerId: highestBid.userId,
          status: "CLOSED"
        }
      });

      if (alreadyWon) {
        return NextResponse.json({ error: `${highestBid.user.name} has already won/lifted a chit in this group` }, { status: 400 });
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

      const dividendPerMember = 0;
      const amountToPayRegular = auction.group.monthlyContribution;

      const paymentOperations = auction.group.members.map(member => {
        const hasWonBefore = previousWinnerIds.has(member.userId);
        const isCurrentWinner = member.userId === highestBid.userId;
        const amount = (hasWonBefore || isCurrentWinner)
          ? (auction.group.liftedContribution || auction.group.monthlyContribution) 
          : amountToPayRegular;

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
            winnerId: highestBid.userId,
            winningBid: 0,
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

      return NextResponse.json({ message: "Auction closed and payments generated!", winner: highestBid.user.name });
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
