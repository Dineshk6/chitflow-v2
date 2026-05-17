import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "MEMBER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { auctionId, amount } = await req.json();
    const userId = session.user.id;

    // 1. Check if the auction is OPEN
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
      include: { group: true }
    });

    if (!auction || auction.status !== "OPEN") {
      return NextResponse.json({ error: "Auction is not live" }, { status: 400 });
    }

    // Check if the user has already won/lifted an auction in this group
    const alreadyWon = await prisma.auction.findFirst({
      where: {
        groupId: auction.groupId,
        winnerId: userId,
        status: "CLOSED"
      }
    });

    if (alreadyWon) {
      return NextResponse.json({ error: "You have already won/lifted a chit in this group" }, { status: 400 });
    }

    // 2. Validate bid (In Chit funds, bid usually means the amount of dividend/discount)
    const maxAllowedBid = auction.group.totalAmount * 0.4; 
    if (amount > maxAllowedBid) {
       return NextResponse.json({ error: "Bid exceeds maximum allowed discount" }, { status: 400 });
    }

    if (amount <= (auction.winningBid || 0)) {
      return NextResponse.json({ error: "Bid must be higher than current winning bid" }, { status: 400 });
    }

    // 3. Create the bid and update auction in a transaction
    const [bid, updatedAuction] = await prisma.$transaction([
      prisma.bid.create({
        data: { auctionId, userId, amount }
      }),
      prisma.auction.update({
        where: { id: auctionId },
        data: { 
          winningBid: amount,
          winnerId: userId
        }
      })
    ]);

    return NextResponse.json({ 
      message: "Bid placed successfully!", 
      bid,
      currentWinningBid: updatedAuction.winningBid 
    }, { status: 201 });
  } catch (error) {
    console.error("Bidding error:", error);
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 });
  }
}
