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

    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment || payment.userId !== session.user.id) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    if (payment.status === "PAID") {
      return NextResponse.json({ error: "Payment already completed" }, { status: 400 });
    }

    // Mark as PAID (In a real app, this would be after a payment gateway success)
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: "PAID",
      }
    });

    return NextResponse.json({ message: "Payment successful!", payment: updatedPayment });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
