import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { listCalendarEvents } from '@/lib/google';
import { upsertRowByEventId } from '@/lib/google';

export async function POST(req: NextRequest) {
  try {
    // Get all Google integrations
    const integrations = await prisma.integration.findMany({
      where: {
        provider: 'GOOGLE',
        NOT: {
          googleCalendarIds: { isEmpty: true },
        },
      },
    });

    for (const integration of integrations) {
      try {
        // Fetch events from Google Calendar (last 7 days to future 30 days)
        const now = new Date();
        const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        const events = await listCalendarEvents(
          integration.id,
          integration.googleCalendarIds,
          timeMin,
          timeMax
        );

        // Upsert each event into DB
        for (const event of events) {
          const existing = await prisma.reservation.findUnique({
            where: { eventId: event.id },
          });

          if (existing) {
            // Update existing
            await prisma.reservation.update({
              where: { eventId: event.id },
              data: {
                title: event.summary,
                start: event.start,
                end: event.end,
                status: event.status === 'cancelled' ? 'cancelled' : existing.status,
              },
            });
          } else {
            // Create new (if it belongs to this workspace)
            await prisma.reservation.create({
              data: {
                workspaceId: integration.workspaceId,
                integrationId: integration.id,
                eventId: event.id,
                calendarId: integration.googleCalendarIds[0],
                title: event.summary,
                service: event.summary.split(' - ')[0] || 'Service',
                source: 'CALENDAR_SYNC',
                status: 'confirmed',
                start: event.start,
                end: event.end,
              },
            });
          }

          // Mirror to Sheets if configured
          if (integration.googleSheetsUrl) {
            try {
              const reservation = await prisma.reservation.findUnique({
                where: { eventId: event.id },
                include: { customer: true },
              });

              if (reservation) {
                await upsertRowByEventId(
                  integration.id,
                  integration.googleSheetsUrl,
                  'Appointments',
                  event.id,
                  [
                    event.id,
                    reservation.status,
                    reservation.service,
                    reservation.staff,
                    reservation.source,
                    event.start.toISOString(),
                    event.end.toISOString(),
                    reservation.customer?.name || '',
                    reservation.customer?.phone || '',
                    reservation.customer?.email || '',
                    new Date().toISOString(),
                  ]
                );
              }
            } catch (error) {
              console.error('Error syncing to Sheets:', error);
            }
          }
        }

        console.log(`Synced ${events.length} events for workspace ${integration.workspaceId}`);
      } catch (error) {
        console.error(`Error syncing integration ${integration.id}:`, error);
      }
    }

    return NextResponse.json({ success: true, synced: integrations.length });
  } catch (error) {
    console.error('Error in sync job:', error);
    return NextResponse.json(
      { error: 'Sync failed' },
      { status: 500 }
    );
  }
}
