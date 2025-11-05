import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
  try {
    // Authenticate request
    const user = await authenticateRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get week start (Sunday)
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Fetch all data in parallel
    const [
      todayReservations,
      pendingReservations,
      totalCustomers,
      weekReservations,
    ] = await Promise.all([
      // Today's bookings
      prisma.reservation.count({
        where: {
          workspaceId: user.workspaceId,
          start: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),

      // Pending confirmations
      prisma.reservation.count({
        where: {
          workspaceId: user.workspaceId,
          status: 'pending',
        },
      }),

      // Total customers
      prisma.customer.count({
        where: {
          workspaceId: user.workspaceId,
        },
      }),

      // This week's completed reservations (for revenue calculation)
      prisma.reservation.findMany({
        where: {
          workspaceId: user.workspaceId,
          start: {
            gte: weekStart,
            lt: weekEnd,
          },
          status: 'confirmed',
        },
        select: {
          service: true,
        },
      }),
    ]);

    // Calculate revenue (mock calculation - you'll need to add price field to reservations or services)
    // For now, assume average of $50 per service
    const thisWeekRevenue = weekReservations.length * 50;

    return NextResponse.json({
      todayBookings: todayReservations,
      totalCustomers,
      pendingConfirmations: pendingReservations,
      thisWeekRevenue,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
