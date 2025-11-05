import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '@/lib/google';
import { upsertRowByEventId } from '@/lib/google';
import { sendSms } from '@/lib/twilio';
import { smsTemplates } from '@/lib/templates';

// GET /api/reservations - List reservations
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
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const where: any = {
      workspaceId: user.workspaceId,
    };

    if (status) {
      where.status = status;
    }

    if (source) {
      where.source = source;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        customer: true,
        integration: true,
      },
      orderBy: {
        start: 'desc',
      },
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create new reservation
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
    const {
      customerName,
      customerPhone,
      customerEmail,
      service,
      staff,
      start,
      end,
      notes,
      notifyBy,
      calendarId,
    } = body;

    // Get Google integration
    const googleIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId: user.workspaceId,
        provider: 'GOOGLE',
      },
    });

    if (!googleIntegration) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Find or create customer
    let customer = await prisma.customer.findFirst({
      where: {
        workspaceId: user.workspaceId,
        OR: [
          { phone: customerPhone },
          { email: customerEmail },
        ],
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          workspaceId: user.workspaceId,
          name: customerName,
          phone: customerPhone,
          email: customerEmail,
        },
      });
    }

    // Create Google Calendar event
    const calEvent = await createCalendarEvent(googleIntegration.id, {
      calendarId: calendarId || googleIntegration.googleCalendarIds[0],
      summary: `${service} - ${customerName}`,
      description: notes,
      start: new Date(start),
      end: new Date(end),
      attendees: customerEmail ? [{ email: customerEmail }] : [],
    });

    // Create reservation in DB
    const reservation = await prisma.reservation.create({
      data: {
        workspaceId: user.workspaceId,
        customerId: customer.id,
        integrationId: googleIntegration.id,
        eventId: calEvent.id,
        calendarId: calendarId || googleIntegration.googleCalendarIds[0],
        title: `${service} - ${customerName}`,
        service,
        staff,
        source: 'WEB',
        notes,
        status: 'confirmed',
        start: new Date(start),
        end: new Date(end),
      },
      include: {
        customer: true,
      },
    });

    // Mirror to Google Sheets if configured
    if (googleIntegration.googleSheetsUrl) {
      try {
        await upsertRowByEventId(
          googleIntegration.id,
          googleIntegration.googleSheetsUrl,
          'Appointments',
          calEvent.id,
          [
            calEvent.id,
            reservation.status,
            service,
            staff,
            'WEB',
            start,
            end,
            customerName,
            customerPhone,
            customerEmail,
            new Date().toISOString(),
          ]
        );
      } catch (error) {
        console.error('Error mirroring to Sheets:', error);
        // Don't fail the whole request if Sheets sync fails
      }
    }

    // Send notification if requested
    if (notifyBy === 'SMS' && customerPhone) {
      const twilioIntegration = await prisma.integration.findFirst({
        where: {
          workspaceId: user.workspaceId,
          provider: 'TWILIO',
        },
      });

      if (twilioIntegration) {
        try {
          await sendSms(twilioIntegration.id, {
            to: customerPhone,
            body: smsTemplates.confirmation({
              name: customerName,
              service,
              date: new Date(start).toLocaleDateString(),
              time: new Date(start).toLocaleTimeString(),
              staff,
            }),
          });
        } catch (error) {
          console.error('Error sending SMS:', error);
        }
      }
    }

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
