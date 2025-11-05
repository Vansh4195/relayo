# Relayo - AI Receptionist Dashboard

A production-ready business management dashboard with real-time integrations for Google Calendar, Google Sheets, and Twilio SMS. Built with Next.js, TypeScript, and Firebase.

## Overview

Relayo is your 24/7 AI receptionist that answers calls & texts, qualifies leads, and schedules into your calendar. This repository contains both the marketing site and the fully functional management dashboard.

### Features

**Marketing Site:**
- Responsive landing page with smooth animations
- Industry-specific pages (Auto, Dental, Home Services, Retail, Wellness)
- Optimized performance for high refresh rate monitors
- GPU-accelerated animations

**Dashboard (Phase 1 + 2 - Production Ready):**
- **Authentication**: Firebase Auth with email/password + Google Sign-In
- **Multi-tenant**: Workspace-based data isolation
- **Reservations**: Full CRUD with Google Calendar, Sheets, and SMS sync
- **Calendar**: Month view calendar (ready for Phase 3 real-time sync)
- **Messages**: Two-pane SMS interface (ready for Phase 3 real conversations)
- **Contacts**: Customer directory (ready for Phase 3 real data)
- **Settings**: Live integration management for Google + Twilio
- **Automated Sync**: Background job syncs Google Calendar every 5 minutes

## 🚀 Quick Start

### Try Demo Mode (No Setup Required)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click **"Continue as Demo"** on the login page to explore with mock data.

### Full Production Setup

For complete setup with Firebase, Google Calendar, Sheets, Twilio, and database:

**📖 See [SETUP.md](./SETUP.md) for step-by-step instructions**

Quick overview:
1. Set up Neon PostgreSQL database
2. Configure Firebase Authentication
3. Set up Google OAuth (Calendar + Sheets APIs)
4. Configure Twilio SMS
5. Update `.env` with all credentials
6. Run database migration: `npx prisma db push`
7. Start server and connect services in Settings UI

### Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[PHASE2_SUMMARY.md](./PHASE2_SUMMARY.md)** - Implementation details

## 📁 Project Structure

```
relayo/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with fonts
│   ├── page.tsx                 # Root route (serves marketing site)
│   ├── login/                   # Login page
│   │   └── page.tsx
│   └── dashboard/               # Dashboard routes
│       ├── layout.tsx           # Dashboard shell (Sidebar + TopBar)
│       ├── page.tsx             # Overview/Stats page
│       ├── reservations/        # Appointment management
│       ├── calendar/            # Calendar view
│       ├── messages/            # Customer communications
│       ├── contacts/            # Customer directory
│       └── settings/            # Integration settings
├── components/
│   └── dashboard/               # Dashboard UI components
│       ├── Sidebar.tsx
│       └── TopBar.tsx
├── lib/
│   ├── datasource/              # Data layer
│   │   ├── types.ts            # TypeScript interfaces
│   │   ├── mock.ts             # Mock data implementation
│   │   └── index.ts            # DataSource exports
│   └── store.ts                 # Zustand global state
├── public/                      # Static assets
│   ├── index.html              # Marketing site HTML
│   ├── styles.css              # Marketing site styles
│   ├── script.js               # Marketing site JS
│   ├── assets/                 # Images, logos, icons
│   └── [other HTML pages]      # Industry-specific pages
└── next.config.js              # Next.js configuration
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **Authentication**: Firebase Auth (email/password + Google OAuth)
- **APIs**: Google Calendar, Google Sheets, Twilio SMS
- **Styling**: Tailwind CSS
- **State Management**: Zustand with localStorage persistence
- **Animations**: Framer Motion
- **Date Handling**: date-fns
- **Deployment**: Vercel with Cron Jobs

## 🔧 Build Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Create optimized production build
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema to database
npx prisma studio    # Open Prisma Studio (database GUI)

# Type checking
npx tsc --noEmit    # Check TypeScript types
```

## 💻 Development Guide

### Data Layer Architecture

The application uses a `DataSource` interface pattern for easy API swapping:

```typescript
// lib/datasource/types.ts
export interface DataSource {
  listAppointments(filters?: AppointmentFilters): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | null>;
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
  // ... more methods
}
```

- **Phase 1 (Current)**: `MockDataSource` provides realistic mock data
- **Phase 2 (Future)**: Replace with real API integrations

### State Management

Global state managed with Zustand:

```typescript
// lib/store.ts
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'light',
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'relayo-app-storage' }
  )
);
```

### Adding a New Dashboard Page

1. **Create page file:**
   ```bash
   app/dashboard/your-page/page.tsx
   ```

2. **Add route to Sidebar:**
   ```typescript
   // components/dashboard/Sidebar.tsx
   const routes = [
     // ... existing routes
     { name: 'Your Page', path: '/dashboard/your-page', icon: YourIcon },
   ];
   ```

3. **Implement page component:**
   ```typescript
   'use client';

   import { dataSource } from '@/lib/datasource';
   import { useAppStore } from '@/lib/store';

   export default function YourPage() {
     // Fetch data and render
     return <div>Your content</div>;
   }
   ```

## 🔑 Key API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/google/callback` | GET | Handle Google OAuth callback |
| `/api/integrations` | GET | List all workspace integrations |
| `/api/integrations/google/init` | POST | Start Google OAuth flow |
| `/api/integrations/google/update` | POST | Save calendar IDs & sheets URL |
| `/api/integrations/twilio/save` | POST | Save Twilio credentials |
| `/api/reservations` | GET | List reservations |
| `/api/reservations` | POST | Create reservation (syncs everywhere) |
| `/api/reservations/[id]` | PATCH | Update reservation |
| `/api/reservations/[id]` | DELETE | Delete reservation |
| `/api/messages/sms` | POST | Send SMS message |
| `/api/webhooks/twilio-sms` | POST | Receive inbound SMS |
| `/api/sync/run` | POST | Trigger manual sync job |

## 📊 Data Flow

### Creating a Reservation:
1. User submits form in dashboard
2. Creates event in Google Calendar (source of truth)
3. Saves to database (for fast queries)
4. Mirrors to Google Sheets (for backup/analytics)
5. Sends SMS notification (if requested)
6. Returns success to UI

### Automated Sync:
1. Vercel Cron runs every 5 minutes
2. Fetches latest events from Google Calendar
3. Updates database with any changes
4. Mirrors changes to Google Sheets
5. Dashboard shows real-time data

## 🚀 Deployment

See **[SETUP.md](./SETUP.md)** section 8 for complete Vercel deployment instructions including:
- Environment variable configuration
- Cron job setup
- OAuth redirect URI updates
- Twilio webhook configuration

Quick deploy:
```bash
# Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# Deploy on Vercel
# 1. Import GitHub repo
# 2. Add environment variables
# 3. Deploy
```

## 🔐 Dashboard Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Marketing site home page | No |
| `/login` | Login page (demo/real auth) | No |
| `/dashboard` | Dashboard overview with stats | Yes |
| `/dashboard/reservations` | Appointment management | Yes |
| `/dashboard/calendar` | Month view calendar | Yes |
| `/dashboard/messages` | SMS inbox | Yes |
| `/dashboard/contacts` | Customer directory | Yes |
| `/dashboard/settings` | Integration management | Yes |

## 📈 What's Next

### Phase 3 Candidates:
- Real-time Messages UI with SMS conversations
- Interactive Calendar view with Google Calendar sync
- Contacts page with real customer CRUD
- Dashboard analytics with real statistics
- Gmail integration for email confirmations
- Scheduled appointment reminders
- Voice call integration
- AI-powered response suggestions

## 🤝 Contributing

This is a production application. For bugs or feature requests, please create an issue.

## 📝 License

MIT License - See LICENSE file for details

---

**Phase 2 Complete! 🎉**

**Status**: Production Ready
**Version**: 2.0
**Server**: Running at http://localhost:3000
**Documentation**: [SETUP.md](./SETUP.md) | [PHASE2_SUMMARY.md](./PHASE2_SUMMARY.md)

Built with ❤️ using Next.js, TypeScript, Firebase, and Claude Code
