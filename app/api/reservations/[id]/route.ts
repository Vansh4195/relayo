import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google';
import { upsertRowByEventId } from '@/lib/google';

// PATCH /api/reservations/[id] - Update reservation
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { status, start, end, notes } = body;
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { integration: true },
    });

    if (!reservation || reservation.workspaceId !== user.workspaceId) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Update Google Calendar event
    if (reservation.integration && (start || end)) {
      await updateCalendarEvent(
        reservation.integrationId!,
        reservation.calendarId,
        reservation.eventId,
        {
          start: start ? new Date(start) : undefined,
          end: end ? new Date(end) : undefined,
        }
      );
    }

    // Update in DB
    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        start: start ? new Date(start) : undefined,
        end: end ? new Date(end) : undefined,
        notes,
      },
      include: {
        customer: true,
      },
    });

    // Mirror to Sheets
    if (reservation.integration?.googleSheetsUrl) {
      try {
        await upsertRowByEventId(
          reservation.integrationId!,
          reservation.integration.googleSheetsUrl,
          'Appointments',
          reservation.eventId,
          [
            reservation.eventId,
            updated.status,
            updated.service,
            updated.staff,
            updated.source,
            updated.start.toISOString(),
            updated.end.toISOString(),
            updated.customer?.name,
            updated.customer?.phone,
            updated.customer?.email,
            updated.updatedAt.toISOString(),
          ]
        );
      } catch (error) {
        console.error('Error mirroring to Sheets:', error);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      { error: 'Failed to update reservation' },
      { status: 500 }
    );
  }
}

// DELETE /api/reservations/[id] - Delete reservation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { integration: true },
    });

    if (!reservation || reservation.workspaceId !== user.workspaceId) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    // Delete from Google Calendar
    if (reservation.integration) {
      try {
        await deleteCalendarEvent(
          reservation.integrationId!,
          reservation.calendarId,
          reservation.eventId
        );
      } catch (error) {
        console.error('Error deleting from Google Calendar:', error);
      }
    }

    // Delete from DB
    await prisma.reservation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      { error: 'Failed to delete reservation' },
      { status: 500 }
    );
  }
}
