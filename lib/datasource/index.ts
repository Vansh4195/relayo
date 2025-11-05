/**
 * DataSource export
 * Phase 1: Export mock implementation
 * Phase 2: Switch to real API implementations based on env vars
 */

import { mockDataSource } from './mock';
import type { DataSource } from './types';

// TODO Phase-2: Add real implementations
// import { GoogleCalendarDataSource } from './google-calendar';
// import { GoogleSheetsDataSource } from './google-sheets';
// import { TwilioSMSDataSource } from './twilio';

/**
 * Active data source
 * Phase 1: Always use mock
 * Phase 2: Choose based on configuration
 */
export const dataSource: DataSource = mockDataSource;

// Re-export types for convenience
export * from './types';
