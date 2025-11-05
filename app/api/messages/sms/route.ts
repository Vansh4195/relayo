import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/twilio';

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
    const { to, body: messageBody, customerId } = body;

    const twilioIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId: user.workspaceId,
        provider: 'TWILIO',
      },
    });

    if (!twilioIntegration) {
      return NextResponse.json(
        { error: 'Twilio not connected' },
        { status: 400 }
      );
    }

    // Send SMS via Twilio
    const result = await sendSms(twilioIntegration.id, {
      to,
      body: messageBody,
    });

    // Store message in DB
    const message = await prisma.message.create({
      data: {
        workspaceId: user.workspaceId,
        customerId,
        direction: 'outbound',
        channel: 'sms',
        body: messageBody,
        toNumber: to,
        fromNumber: twilioIntegration.twilioFromNumber!,
        providerId: result.sid,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
