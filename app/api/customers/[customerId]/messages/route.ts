import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { customerId: string } }) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const { customerId } = params;
    const workspaceId = user.workspaceId;

    // Verify customer belongs to workspace
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        workspaceId,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch all messages for this customer
    const messages = await prisma.message.findMany({
      where: {
        customerId,
        workspaceId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching customer messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
