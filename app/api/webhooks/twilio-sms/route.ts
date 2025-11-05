import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    // Find workspace by Twilio number
    const integration = await prisma.integration.findFirst({
      where: {
        twilioFromNumber: to,
        provider: 'TWILIO',
      },
    });

    if (!integration) {
      console.warn('No integration found for number:', to);
      return new NextResponse('OK', { status: 200 });
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        workspaceId: integration.workspaceId,
        phone: from,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          workspaceId: integration.workspaceId,
          phone: from,
          name: from, // Use phone as name initially
        },
      });
    }

    // Store inbound message
    await prisma.message.create({
      data: {
        workspaceId: integration.workspaceId,
        customerId: customer.id,
        direction: 'inbound',
        channel: 'sms',
        body,
        fromNumber: from,
        toNumber: to,
        providerId: messageSid,
      },
    });

    // Return TwiML response
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
