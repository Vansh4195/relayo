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
    const { sid, authToken, fromNumber } = body;

    if (!sid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId: user.workspaceId,
        provider: 'TWILIO',
      },
    });

    if (existingIntegration) {
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          twilioSid: sid,
          twilioAuthToken: authToken,
          twilioFromNumber: fromNumber,
        },
      });
    } else {
      await prisma.integration.create({
        data: {
          workspaceId: user.workspaceId,
          provider: 'TWILIO',
          label: 'Twilio SMS',
          twilioSid: sid,
          twilioAuthToken: authToken,
          twilioFromNumber: fromNumber,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving Twilio integration:', error);
    return NextResponse.json(
      { error: 'Failed to save Twilio integration' },
      { status: 500 }
    );
  }
}
