import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { prisma } from '@/lib/prisma';

interface ConversationSummary {
  threadId: string;
  customerName: string;
  customerContact: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  channel: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
}

interface MessageWithCustomer {
  id: string;
  customerId: string | null;
  direction: string;
  channel: string;
  body: string;
  toNumber: string | null;
  fromNumber: string | null;
  createdAt: Date;
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
  } | null;
}

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    const workspaceId = user.workspaceId;

    // Fetch all messages with customer info
    const messages = await prisma.message.findMany({
      where: {
        workspaceId,
      },
      include: {
        customer: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Group messages by customer
    const conversationMap = new Map<string, ConversationSummary>();

    for (const message of messages as MessageWithCustomer[]) {
      // Skip messages without customer
      if (!message.customerId || !message.customer) continue;

      const customerId = message.customerId;
      const customerPhone = message.customer.phone || message.fromNumber || message.toNumber || '';
      const threadId = `customer-${customerId}`;

      if (!conversationMap.has(threadId)) {
        conversationMap.set(threadId, {
          threadId,
          customerName: message.customer.name || customerPhone || 'Unknown',
          customerContact: customerPhone,
          lastMessage: message.body,
          lastMessageTime: message.createdAt,
          unreadCount: message.direction === 'inbound' ? 1 : 0,
          channel: message.channel,
          customer: {
            id: message.customer.id,
            name: message.customer.name || '',
            phone: customerPhone,
            email: message.customer.email || undefined,
          },
        });
      } else {
        const conv = conversationMap.get(threadId)!;
        // Update last message if this is newer
        if (message.createdAt > conv.lastMessageTime) {
          conv.lastMessage = message.body;
          conv.lastMessageTime = message.createdAt;
        }
        // Increment unread count for inbound messages
        if (message.direction === 'inbound') {
          conv.unreadCount += 1;
        }
      }
    }

    // Convert map to array
    const conversations = Array.from(conversationMap.values());

    // Sort by last message time
    conversations.sort((a, b) =>
      b.lastMessageTime.getTime() - a.lastMessageTime.getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
