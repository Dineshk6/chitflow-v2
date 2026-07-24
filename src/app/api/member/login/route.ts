import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return NextResponse.json({ error: 'Valid 10-digit phone number required' }, { status: 400 });
    }

    // Find user by phone or mobile (allowing both ADMIN agents and MEMBER users)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone },
          { mobile: phone }
        ]
      },
      select: { id: true, name: true, phone: true, mobile: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Mobile number not registered. Contact your agent.' }, { status: 404 });
    }

    return NextResponse.json({
      memberId: user.id,
      name: user.name,
      phone: user.phone || user.mobile || phone,
      role: user.role
    });
  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
