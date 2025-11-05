import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

// GET /api/customers - List customers
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
    const search = searchParams.get('search');

    const where: any = {
      workspaceId: user.workspaceId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        reservations: {
          orderBy: {
            start: 'desc',
          },
          take: 5,
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create customer
export const dynamic = 'force-dynamic';
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
    const { name, phone, email } = body;

    // Check if customer already exists
    const existing = await prisma.customer.findFirst({
      where: {
        workspaceId: user.workspaceId,
        OR: [
          { phone },
          { email },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this phone or email already exists' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
      data: {
        workspaceId: user.workspaceId,
        name,
        phone,
        email,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}
