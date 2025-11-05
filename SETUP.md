# Relayo Phase 2 Setup Guide

This guide will walk you through setting up all the integrations and services needed to run Relayo in production with real data.

## Table of Contents

1. [Database Setup (Neon)](#1-database-setup-neon)
2. [Firebase Setup](#2-firebase-setup)
3. [Google OAuth Setup](#3-google-oauth-setup)
4. [Twilio Setup](#4-twilio-setup)
5. [Environment Variables](#5-environment-variables)
6. [Database Migration](#6-database-migration)
7. [Testing the Setup](#7-testing-the-setup)
8. [Deployment (Vercel)](#8-deployment-vercel)

---

## 1. Database Setup (Neon)

Relayo uses PostgreSQL hosted on Neon for data storage.

### Steps:

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up for a free account

2. **Create a New Project**
   - Click "Create Project"
   - Choose a name (e.g., "relayo-production")
   - Select your region

3. **Get Database Connection String**
   - In your project dashboard, click "Connection Details"
   - Copy the connection string (it should look like):
     ```
     postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech:5432/neondb?sslmode=require
     ```

4. **Update .env**
   - Replace the placeholder `DATABASE_URL` with your Neon connection string

---

## 2. Firebase Setup

Firebase is used for authentication (email/password and Google Sign-In).

### Steps:

1. **Create Firebase Project**
   - Go to [console.firebase.google.com](https://console.firebase.google.com)
   - Click "Add project"
   - Enter project name (e.g., "relayo")
   - Disable Google Analytics (optional)
   - Click "Create project"

2. **Enable Authentication Methods**
   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Enable "Email/Password"
   - Enable "Google" (you'll configure OAuth later)

3. **Get Client SDK Configuration**
   - Go to Project Settings (gear icon) > "General"
   - Scroll down to "Your apps" > Click Web icon (</>)
   - Register app with nickname "Relayo Web"
   - Copy the Firebase config object:
     ```javascript
     {
       apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
       authDomain: "relayo-xxxxx.firebaseapp.com",
       projectId: "relayo-xxxxx",
       storageBucket: "relayo-xxxxx.appspot.com",
       messagingSenderId: "123456789012",
       appId: "1:123456789012:web:xxxxxxxxxxxxx"
     }
     ```

4. **Update .env with Client SDK values**
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="relayo-xxxxx.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="relayo-xxxxx"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="relayo-xxxxx.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
   NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:xxxxxxxxxxxxx"
   ```

5. **Generate Service Account (Admin SDK)**
   - Go to Project Settings > "Service accounts"
   - Click "Generate new private key"
   - Save the JSON file (keep it secure!)
   - Open the JSON and extract:
     - `project_id` → `FIREBASE_PROJECT_ID`
     - `client_email` → `FIREBASE_CLIENT_EMAIL`
     - `private_key` → `FIREBASE_PRIVATE_KEY` (keep the quotes and newlines)

6. **Update .env with Admin SDK values**
   ```bash
   FIREBASE_PROJECT_ID="relayo-xxxxx"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@relayo-xxxxx.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----\n"
   ```

---

## 3. Google OAuth Setup

Google OAuth is used for:
- Google Sign-In authentication (via Firebase)
- Google Calendar API access
- Google Sheets API access

### Steps:

1. **Create Google Cloud Project**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create a new project or select existing Firebase project
   - Enable billing (required for APIs)

2. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Search and enable:
     - Google Calendar API
     - Google Sheets API

3. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Choose "External" (or "Internal" if using Google Workspace)
   - Fill in:
     - App name: "Relayo"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Add scopes:
     - `https://www.googleapis.com/auth/calendar`
     - `https://www.googleapis.com/auth/calendar.events`
     - `https://www.googleapis.com/auth/spreadsheets`
   - Click "Save and Continue"
   - Add test users (if in testing mode)

4. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Relayo Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback`
     - `https://yourdomain.com/api/auth/google/callback`
   - Click "Create"
   - Copy Client ID and Client Secret

5. **Update .env**
   ```bash
   GOOGLE_CLIENT_ID="123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxx"
   GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
   ```

6. **Add OAuth Client to Firebase** (for Google Sign-In)
   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Click on "Google"
   - Expand "Web SDK configuration"
   - Paste your Google Client ID and Secret
   - Save

---

## 4. Twilio Setup

Twilio is used for sending and receiving SMS messages.

### Steps:

1. **Create Twilio Account**
   - Go to [twilio.com](https://www.twilio.com)
   - Sign up for a free trial (or paid account)

2. **Get Account Credentials**
   - From Twilio Console dashboard, copy:
     - Account SID (starts with AC...)
     - Auth Token (click to reveal)

3. **Purchase a Phone Number**
   - Go to "Phone Numbers" > "Buy a number"
   - Choose a number that supports SMS
   - Purchase the number
   - Copy the phone number (format: +1234567890)

4. **Configure Webhook for Inbound SMS**
   - Go to "Phone Numbers" > "Manage" > "Active numbers"
   - Click on your purchased number
   - Scroll to "Messaging Configuration"
   - Under "A MESSAGE COMES IN":
     - Webhook: `https://yourdomain.com/api/webhooks/twilio-sms`
     - HTTP Method: POST
   - Click "Save"

5. **Update .env**
   ```bash
   TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   TWILIO_AUTH_TOKEN="your_auth_token_here"
   TWILIO_FROM_NUMBER="+1234567890"
   ```

**Note:** For production, you'll configure the webhook URL in the Relayo Settings UI after deployment.

---

## 5. Environment Variables

Your final `.env` file should look like this:

```bash
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech:5432/neondb?sslmode=require"

# Firebase Admin SDK (Server-side)
FIREBASE_PROJECT_ID="relayo-xxxxx"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@relayo-xxxxx.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"

# Firebase Client SDK (Public)
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="relayo-xxxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="relayo-xxxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="relayo-xxxxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789012"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789012:web:xxxxxxxxxxxxx"

# Google OAuth
GOOGLE_CLIENT_ID="123456789012-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxxxxx"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"

# Twilio
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token_here"
TWILIO_FROM_NUMBER="+1234567890"

# Encryption (Generate a random 32-character string)
ENCRYPTION_KEY="your-random-32-char-encryption-key"

# NextAuth
NEXTAUTH_SECRET="your-random-nextauth-secret-for-production"
NEXTAUTH_URL="http://localhost:3000"
```

### Generating Secure Keys:

For `ENCRYPTION_KEY` and `NEXTAUTH_SECRET`, generate random strings:

```bash
# Generate random 32-char string (macOS/Linux)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 6. Database Migration

After configuring your database connection, run the Prisma migration:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

---

## 7. Testing the Setup

### 7.1 Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 7.2 Test Authentication

1. Click "Get Started" or go to `/login`
2. Try "Continue as Demo" (should work without any setup)
3. Try "Sign Up" with email/password
4. Try "Sign in with Google"

### 7.3 Test Google Calendar Connection

1. Log in to dashboard
2. Go to Settings
3. Click "Connect" on Google Calendar
4. Complete OAuth flow
5. After redirect, click "Configure"
6. Enter calendar IDs (comma-separated):
   - `primary` (your main calendar)
   - Or specific calendar ID from Google Calendar settings
7. Save

### 7.4 Test Google Sheets Connection

1. Create a new Google Sheet
2. Add a tab named "Appointments"
3. Add headers in first row:
   ```
   Event ID | Status | Service | Staff | Source | Start | End | Customer Name | Customer Phone | Customer Email | Updated At
   ```
4. Share the sheet with your service account email:
   - Get email from `FIREBASE_CLIENT_EMAIL` in .env
   - Share with "Editor" access
5. In Settings, click "Configure" on Google Sheets
6. Paste the full spreadsheet URL
7. Save

### 7.5 Test Twilio SMS

1. In Settings, click "Configure" on Twilio
2. Enter Account SID, Auth Token, From Number
3. Save
4. Go to Reservations and create a new appointment
5. Select "SMS" notification
6. Check if SMS is sent

### 7.6 Test Inbound SMS

1. Send an SMS to your Twilio number
2. Check dashboard > Messages to see the inbound message

---

## 8. Deployment (Vercel)

### Steps:

1. **Push Code to Git**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/relayo.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Import your GitHub repository
   - Configure project:
     - Framework: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Add Environment Variables**
   - In Vercel dashboard, go to "Settings" > "Environment Variables"
   - Add all variables from your `.env` file
   - **Important:** Update these for production:
     - `GOOGLE_REDIRECT_URI` → `https://yourdomain.vercel.app/api/auth/google/callback`
     - `NEXTAUTH_URL` → `https://yourdomain.vercel.app`

4. **Update Google OAuth Redirect URIs**
   - Go back to Google Cloud Console > Credentials
   - Add production redirect URI: `https://yourdomain.vercel.app/api/auth/google/callback`

5. **Update Twilio Webhook**
   - Go to Twilio Console > Phone Numbers
   - Update webhook URL to: `https://yourdomain.vercel.app/api/webhooks/twilio-sms`

6. **Configure Vercel Cron (for sync job)**
   - Create `vercel.json` in project root:
   ```json
   {
     "crons": [
       {
         "path": "/api/sync/run",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```
   - This runs the sync every 5 minutes
   - Commit and push

7. **Deploy**
   ```bash
   git add vercel.json
   git commit -m "Add cron job"
   git push
   ```

---

## Troubleshooting

### Common Issues:

1. **"Invalid token" errors**
   - Check Firebase credentials are correct
   - Ensure private key is properly escaped (with \n for newlines)

2. **Google Calendar/Sheets not syncing**
   - Verify APIs are enabled in Google Cloud Console
   - Check service account has access to the sheet
   - Check calendar IDs are correct

3. **SMS not sending**
   - Verify Twilio credentials
   - Check Twilio account balance
   - Ensure phone number is verified (trial accounts)

4. **Database connection errors**
   - Verify Neon connection string is correct
   - Check if IP is whitelisted (Neon allows all by default)
   - Run `npx prisma db push` to ensure schema is up to date

---

## Next Steps

After successful setup:

1. **Customize Templates**
   - Edit SMS templates in `lib/templates.ts`
   - Add email templates when Gmail integration is ready

2. **Add Team Members**
   - Invite users via Firebase Authentication
   - They'll auto-create workspaces on first login

3. **Configure Sync Frequency**
   - Adjust cron schedule in `vercel.json`
   - Consider more frequent syncs (every 2-3 minutes) for busy calendars

4. **Monitor Usage**
   - Check Twilio usage dashboard
   - Monitor Google API quotas
   - Set up alerts in Vercel

---

## Support

For issues or questions:
- Check the GitHub Issues: [github.com/yourrepo/relayo/issues](https://github.com/yourrepo/relayo/issues)
- Email: support@relayo.com

---

**Congratulations! Your Relayo dashboard is now fully configured and ready for production use.**
