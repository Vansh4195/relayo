/**
 * Mock DataSource implementation for Phase 1
 * Uses in-memory data with realistic fixtures
 * Phase 2: Replace with real API implementations
 */

import type {
  DataSource,
  Appointment,
  Customer,
  Staff,
  Service,
  Message,
  ConversationSummary,
  MessageThread,
  AppointmentFilters,
  CreateAppointmentInput,
  UpdateAppointmentInput,
  AppointmentStatus,
  MessageChannel,
} from './types';

// Seed Data
const CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Sarah Johnson', phone: '+1-555-0101', email: 'sarah.j@email.com' },
  { id: 'c2', name: 'Michael Chen', phone: '+1-555-0102', email: 'mchen@email.com' },
  { id: 'c3', name: 'Emily Rodriguez', phone: '+1-555-0103', email: 'emily.r@email.com' },
  { id: 'c4', name: 'David Kim', phone: '+1-555-0104', email: 'dkim@email.com' },
  { id: 'c5', name: 'Jessica Martinez', phone: '+1-555-0105', email: 'jmartinez@email.com' },
  { id: 'c6', name: 'Ryan Thompson', phone: '+1-555-0106', email: 'ryan.t@email.com' },
  { id: 'c7', name: 'Amanda Lewis', phone: '+1-555-0107', email: 'alewis@email.com' },
  { id: 'c8', name: 'Christopher Lee', phone: '+1-555-0108', email: 'clee@email.com' },
  { id: 'c9', name: 'Lauren Garcia', phone: '+1-555-0109', email: 'lgarcia@email.com' },
  { id: 'c10', name: 'Brandon Wilson', phone: '+1-555-0110', email: 'bwilson@email.com' },
];

const STAFF: Staff[] = [
  { id: 's1', name: 'Alex Rivera', email: 'alex@relayo.com', color: '#3B5BFF' },
  { id: 's2', name: 'Jordan Smith', email: 'jordan@relayo.com', color: '#10B981' },
  { id: 's3', name: 'Taylor Johnson', email: 'taylor@relayo.com', color: '#F59E0B' },
];

const SERVICES: Service[] = [
  { id: 'sv1', name: 'Haircut', duration: 45, price: 50 },
  { id: 'sv2', name: 'Hair Coloring', duration: 120, price: 150 },
  { id: 'sv3', name: 'Facial Treatment', duration: 60, price: 80 },
  { id: 'sv4', name: 'Manicure', duration: 30, price: 35 },
  { id: 'sv5', name: 'Massage', duration: 90, price: 120 },
  { id: 'sv6', name: 'Dinner for 2', duration: 90, price: 80 },
  { id: 'sv7', name: 'Consultation', duration: 30, price: 0 },
];

// Generate realistic appointments
function generateMockAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  const statuses: AppointmentStatus[] = ['confirmed', 'pending', 'cancelled', 'completed'];
  const sources = ['call', 'sms', 'web', 'email', 'walk-in'] as const;

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 3);

  for (let day = 0; day < 7; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);

    const apptCount = Math.floor(Math.random() * 5) + 4;

    for (let i = 0; i < apptCount; i++) {
      const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
      const staff = STAFF[Math.floor(Math.random() * STAFF.length)];
      const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];

      const hour = Math.floor(Math.random() * 9) + 9;
      const start = new Date(date);
      start.setHours(hour, [0, 15, 30, 45][Math.floor(Math.random() * 4)], 0, 0);

      const end = new Date(start);
      end.setMinutes(end.getMinutes() + service.duration);

      let status: AppointmentStatus;
      if (start < now) {
        status = Math.random() > 0.2 ? 'completed' : 'no-show';
      } else {
        status = Math.random() > 0.3 ? 'confirmed' : 'pending';
      }

      appointments.push({
        id: `a${day}-${i}`,
        status,
        customer: { ...customer },
        staff: { ...staff },
        service: { ...service },
        start,
        end,
        source: sources[Math.floor(Math.random() * sources.length)],
        notes: i % 3 === 0 ? 'Customer requested quiet area' : undefined,
        partySize: service.name.includes('Dinner') ? Math.floor(Math.random() * 4) + 2 : undefined,
        createdAt: new Date(start.getTime() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(),
      });
    }
  }

  return appointments.sort((a, b) => b.start.getTime() - a.start.getTime());
}

// Generate mock conversations
function generateMockConversations(): MessageThread[] {
  const threads: MessageThread[] = [];
  const channels: MessageChannel[] = ['sms', 'email'];

  for (let i = 0; i < 8; i++) {
    const customer = CUSTOMERS[i];
    const channel = channels[i % 2];
    const threadId = `thread-${i}`;

    const messages: Message[] = [
      {
        id: `msg-${i}-1`,
        threadId,
        channel,
        from: customer.phone,
        to: '+1-555-RELAYO',
        body: 'Hi, I\'d like to book an appointment for next Tuesday.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        read: true,
        sentByUs: false,
      },
      {
        id: `msg-${i}-2`,
        threadId,
        channel,
        from: '+1-555-RELAYO',
        to: customer.phone,
        body: 'Of course! What time works best for you?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
        read: true,
        sentByUs: true,
      },
    ];

    if (i < 3) {
      messages.push({
        id: `msg-${i}-3`,
        threadId,
        channel,
        from: customer.phone,
        to: '+1-555-RELAYO',
        body: 'Morning would be great, around 10 AM?',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        read: i === 0,
        sentByUs: false,
      });
    }

    threads.push({
      threadId,
      customer: { ...customer },
      messages,
      channel,
    });
  }

  return threads;
}

let mockAppointments = generateMockAppointments();
let mockThreads = generateMockConversations();

export class MockDataSource implements DataSource {
  async listAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    await this.simulateDelay();

    let results = [...mockAppointments];

    if (filters) {
      if (filters.status?.length) {
        results = results.filter((a) => filters.status!.includes(a.status));
      }
      if (filters.source?.length) {
        results = results.filter((a) => filters.source!.includes(a.source));
      }
      if (filters.staffId?.length) {
        results = results.filter((a) => filters.staffId!.includes(a.staff.id));
      }
      if (filters.serviceId?.length) {
        results = results.filter((a) => filters.serviceId!.includes(a.service.id));
      }
      if (filters.dateRange) {
        results = results.filter(
          (a) => a.start >= filters.dateRange!.start && a.start <= filters.dateRange!.end
        );
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        results = results.filter(
          (a) =>
            a.customer.name.toLowerCase().includes(search) ||
            a.customer.phone.includes(search) ||
            a.service.name.toLowerCase().includes(search)
        );
      }
    }

    return results;
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    await this.simulateDelay();
    return mockAppointments.find((a) => a.id === id) || null;
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    await this.simulateDelay();

    const customer = CUSTOMERS.find((c) => c.id === input.customerId)!;
    const staff = STAFF.find((s) => s.id === input.staffId)!;
    const service = SERVICES.find((s) => s.id === input.serviceId)!;

    const end = new Date(input.start);
    end.setMinutes(end.getMinutes() + service.duration);

    const newAppt: Appointment = {
      id: `a-${Date.now()}`,
      status: 'pending',
      customer: { ...customer },
      staff: { ...staff },
      service: { ...service },
      start: input.start,
      end,
      source: 'web',
      notes: input.notes,
      partySize: input.partySize,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAppointments.unshift(newAppt);
    return newAppt;
  }

  async updateAppointment(id: string, patch: UpdateAppointmentInput): Promise<Appointment> {
    await this.simulateDelay();

    const index = mockAppointments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    const appt = mockAppointments[index];

    if (patch.status) appt.status = patch.status;
    if (patch.notes !== undefined) appt.notes = patch.notes;
    if (patch.start) {
      appt.start = patch.start;
      appt.end = new Date(patch.start);
      appt.end.setMinutes(appt.end.getMinutes() + appt.service.duration);
    }
    if (patch.staffId) {
      appt.staff = STAFF.find((s) => s.id === patch.staffId)!;
    }

    appt.updatedAt = new Date();
    mockAppointments[index] = appt;

    return appt;
  }

  async cancelAppointment(id: string, reason?: string): Promise<void> {
    await this.simulateDelay();
    await this.updateAppointment(id, { status: 'cancelled', notes: reason });
  }

  async listConversations(): Promise<ConversationSummary[]> {
    await this.simulateDelay();

    return mockThreads.map((thread) => {
      const lastMsg = thread.messages[thread.messages.length - 1];
      const unreadCount = thread.messages.filter((m) => !m.read && !m.sentByUs).length;

      return {
        threadId: thread.threadId,
        customerName: thread.customer.name,
        customerContact: thread.customer.phone,
        lastMessage: lastMsg.body,
        lastMessageTime: lastMsg.timestamp,
        unreadCount,
        channel: thread.channel,
      };
    }).sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
  }

  async getConversation(threadId: string): Promise<MessageThread | null> {
    await this.simulateDelay();
    return mockThreads.find((t) => t.threadId === threadId) || null;
  }

  async sendMessage(params: { to: string; body: string; channel: MessageChannel }): Promise<Message> {
    await this.simulateDelay();

    const thread = mockThreads.find((t) => t.customer.phone === params.to);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      threadId: thread?.threadId || `thread-new-${Date.now()}`,
      channel: params.channel,
      from: '+1-555-RELAYO',
      to: params.to,
      body: params.body,
      timestamp: new Date(),
      read: true,
      sentByUs: true,
    };

    if (thread) {
      thread.messages.push(newMessage);
    }

    return newMessage;
  }

  async markAsRead(threadId: string): Promise<void> {
    await this.simulateDelay();
    const thread = mockThreads.find((t) => t.threadId === threadId);
    if (thread) {
      thread.messages.forEach((m) => {
        if (!m.sentByUs) m.read = true;
      });
    }
  }

  async listCustomers(): Promise<Customer[]> {
    await this.simulateDelay();
    return [...CUSTOMERS];
  }

  async getCustomer(id: string): Promise<Customer | null> {
    await this.simulateDelay();
    return CUSTOMERS.find((c) => c.id === id) || null;
  }

  async listStaff(): Promise<Staff[]> {
    await this.simulateDelay();
    return [...STAFF];
  }

  async listServices(): Promise<Service[]> {
    await this.simulateDelay();
    return [...SERVICES];
  }

  private simulateDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  }
}

export const mockDataSource = new MockDataSource();
