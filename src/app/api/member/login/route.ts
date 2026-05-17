import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 });
    }

    // Find user by phone
    const user = await prisma.user.findFirst({
      where: { phone } as any,
      select: { id: true, name: true, phone: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Mobile number not registered. Contact your agent.' }, { status: 404 });
    }

    // Ensure it's a regular member (not admin)
    if ((user as any).role === 'ADMIN') {
      return NextResponse.json({ error: 'Please use the Agent Portal to log in.' }, { status: 403 });
    }

    return NextResponse.json({ memberId: user.id, name: user.name, phone: user.phone });
  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
