import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { calendarIds, sheetsUrl } = body;

    const integration = await prisma.integration.findFirst({
      where: {
        workspaceId: user.workspaceId,
        provider: 'GOOGLE',
      },
    });

    if (!integration) {
      return NextResponse.json(
        { error: 'Google integration not found' },
        { status: 404 }
      );
    }

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        googleCalendarIds: calendarIds || [],
        googleSheetsUrl: sheetsUrl || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating Google integration:', error);
    return NextResponse.json(
      { error: 'Failed to update integration' },
      { status: 500 }
    );
  }
}
