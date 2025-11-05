import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from './prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

/**
 * Get OAuth2 client for a specific integration
 */
export async function getOAuthClientForIntegration(integrationId: string) {
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration || !integration.googleRefreshToken) {
    throw new Error('Integration not found or not configured');
  }

  const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: integration.googleAccessToken,
    refresh_token: integration.googleRefreshToken,
    expiry_date: integration.googleExpiry?.getTime(),
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          googleAccessToken: tokens.access_token || null,
          googleRefreshToken: tokens.refresh_token,
          googleExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    } else if (tokens.access_token) {
      await prisma.integration.update({
        where: { id: integrationId },
        data: {
          googleAccessToken: tokens.access_token,
          googleExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    }
  });

  return oauth2Client;
}

/**
 * Initialize OAuth flow
 */
export function getAuthUrl() {
  const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/gmail.send',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    include_granted_scopes: true,
    response_type: 'code',
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ==================== CALENDAR ====================

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  status?: string;
  attendees?: Array<{ email: string; displayName?: string }>;
}

export interface CreateEventInput {
  calendarId: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: Array<{ email: string }>;
}

/**
 * List events from Google Calendar
 */
export async function listCalendarEvents(
  integrationId: string,
  calendarIds: string[],
  timeMin?: Date,
  timeMax?: Date
): Promise<CalendarEvent[]> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const allEvents: CalendarEvent[] = [];

  for (const calendarId of calendarIds) {
    try {
      const response = await calendar.events.list({
        calendarId,
        timeMin: timeMin?.toISOString(),
        timeMax: timeMax?.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = response.data.items || [];
      allEvents.push(
        ...events.map((event) => ({
          id: event.id!,
          summary: event.summary || 'Untitled',
          description: event.description || undefined,
          start: new Date(event.start?.dateTime || event.start?.date!),
          end: new Date(event.end?.dateTime || event.end?.date!),
          status: event.status || undefined,
          attendees: event.attendees?.map((a) => ({
            email: a.email!,
            displayName: a.displayName || undefined,
          })),
        }))
      );
    } catch (error) {
      console.error(`Error fetching events from calendar ${calendarId}:`, error);
    }
  }

  return allEvents;
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  integrationId: string,
  input: CreateEventInput
): Promise<CalendarEvent> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.insert({
    calendarId: input.calendarId,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: {
        dateTime: input.start.toISOString(),
      },
      end: {
        dateTime: input.end.toISOString(),
      },
      attendees: input.attendees,
    },
  });

  const event = response.data;
  return {
    id: event.id!,
    summary: event.summary || 'Untitled',
    description: event.description || undefined,
    start: new Date(event.start?.dateTime || event.start?.date!),
    end: new Date(event.end?.dateTime || event.end?.date!),
    status: event.status || undefined,
  };
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  integrationId: string,
  calendarId: string,
  eventId: string,
  updates: Partial<CreateEventInput>
): Promise<CalendarEvent> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: {
      summary: updates.summary,
      description: updates.description,
      start: updates.start ? { dateTime: updates.start.toISOString() } : undefined,
      end: updates.end ? { dateTime: updates.end.toISOString() } : undefined,
    },
  });

  const event = response.data;
  return {
    id: event.id!,
    summary: event.summary || 'Untitled',
    description: event.description || undefined,
    start: new Date(event.start?.dateTime || event.start?.date!),
    end: new Date(event.end?.dateTime || event.end?.date!),
    status: event.status || undefined,
  };
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(
  integrationId: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

/**
 * List available calendars for user
 */
export async function listCalendars(integrationId: string) {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const response = await calendar.calendarList.list();
  return response.data.items || [];
}

// ==================== SHEETS ====================

/**
 * Append a row to a Google Sheet
 */
export async function appendRowToSheet(
  integrationId: string,
  spreadsheetUrl: string,
  sheetName: string,
  values: any[]
): Promise<void> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  // Extract spreadsheet ID from URL
  const spreadsheetId = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  });
}

/**
 * Upsert a row by eventId in Google Sheets
 */
export async function upsertRowByEventId(
  integrationId: string,
  spreadsheetUrl: string,
  sheetName: string,
  eventId: string,
  values: any[]
): Promise<void> {
  const oauth2Client = await getOAuthClientForIntegration(integrationId);
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const spreadsheetId = spreadsheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!spreadsheetId) {
    throw new Error('Invalid spreadsheet URL');
  }

  // Read all rows
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = response.data.values || [];
  const eventIdColumnIndex = 0; // Assuming eventId is in column A

  // Find row with matching eventId
  const rowIndex = rows.findIndex((row) => row[eventIdColumnIndex] === eventId);

  if (rowIndex === -1) {
    // Row doesn't exist, append it
    await appendRowToSheet(integrationId, spreadsheetUrl, sheetName, values);
  } else {
    // Row exists, update it
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex + 1}:Z${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [values],
      },
    });
  }
}
