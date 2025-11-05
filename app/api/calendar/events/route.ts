import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const where: any = {
      workspaceId: user.workspaceId,
    };

    if (start && end) {
      where.start = {
        gte: new Date(start),
        lte: new Date(end),
      };
    }

    const events = await prisma.reservation.findMany({
      where,
      include: {
        customer: true,
      },
      orderBy: {
        start: 'asc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}
