/**
 * Core data types for Relayo Dashboard
 * Phase 1: Used with mock data
 * Phase 2: Will be populated by Google Calendar, Sheets, SMS/Gmail APIs
 */

export type AppointmentStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'no-show';
export type AppointmentSource = 'call' | 'sms' | 'web' | 'email' | 'walk-in';
export type MessageChannel = 'sms' | 'email' | 'web';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  notes?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string; // For calendar color-coding
}

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price?: number;
}

export interface Appointment {
  id: string;
  status: AppointmentStatus;
  customer: Customer;
  staff: Staff;
  service: Service;
  start: Date;
  end: Date;
  source: AppointmentSource;
  notes?: string;
  partySize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  threadId: string;
  channel: MessageChannel;
  from: string; // phone or email
  to: string;
  body: string;
  timestamp: Date;
  read: boolean;
  sentByUs: boolean;
}

export interface ConversationSummary {
  threadId: string;
  customerName: string;
  customerContact: string; // phone or email
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  channel: MessageChannel;
}

export interface MessageThread {
  threadId: string;
  customer: Customer;
  messages: Message[];
  channel: MessageChannel;
}

export interface AppointmentFilters {
  status?: AppointmentStatus[];
  source?: AppointmentSource[];
  staffId?: string[];
  serviceId?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}

export interface CreateAppointmentInput {
  customerId: string;
  staffId: string;
  serviceId: string;
  start: Date;
  notes?: string;
  partySize?: number;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  staffId?: string;
  start?: Date;
  notes?: string;
}

/**
 * DataSource interface - abstraction layer for all data operations
 * Phase 1: Implemented with mock in-memory data
 * Phase 2: Implement with Google Calendar, Sheets, and messaging APIs
 */
export interface DataSource {
  // Appointments
  listAppointments(filters?: AppointmentFilters): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | null>;
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
  updateAppointment(id: string, patch: UpdateAppointmentInput): Promise<Appointment>;
  cancelAppointment(id: string, reason?: string): Promise<void>;

  // Messages
  listConversations(): Promise<ConversationSummary[]>;
  getConversation(threadId: string): Promise<MessageThread | null>;
  sendMessage(params: { to: string; body: string; channel: MessageChannel }): Promise<Message>;
  markAsRead(threadId: string): Promise<void>;

  // Customers & Staff
  listCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | null>;
  listStaff(): Promise<Staff[]>;

  // Services
  listServices(): Promise<Service[]>;
}

// KPI / Stats types
export interface DashboardStats {
  todayBookings: number;
  pendingConfirmations: number;
  noShows: number;
  revenue: number;
  occupancyRate: number;
}

export interface TimeSlotOccupancy {
  hour: number; // 0-23
  bookings: number;
  capacity: number;
}
