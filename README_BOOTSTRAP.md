# Relayo Bootstrap Script Guide

This guide explains how to use the `bootstrap.sh` script to automatically configure your Relayo dashboard with all integrations.

## What Does This Script Do?

The bootstrap script automates the entire Phase 2 setup process:

✅ **Neon Postgres** - Creates database and configures connection
✅ **Firebase Authentication** - Sets up email/password + Google Sign-In
✅ **Google Cloud OAuth** - Configures Calendar + Sheets API access
✅ **Twilio SMS** - Sets up phone number and webhooks
✅ **Prisma Migration** - Creates database schema
✅ **Vercel Deployment** - Deploys to production (optional)
✅ **Helper Scripts** - Generates utility scripts for common tasks

## Prerequisites

### Required Tools

Before running the script, ensure you have:

- **Node.js 18+** - [Download](https://nodejs.org)
- **npm or pnpm** - Comes with Node.js
- **Git** - [Download](https://git-scm.com)
- **jq** - JSON processor
  - macOS: `brew install jq`
  - Linux: `apt-get install jq`
- **openssl** - Usually pre-installed

### Optional (Script will offer to install)

- **firebase-tools** - `npm install -g firebase-tools`
- **vercel** - `npm install -g vercel`
- **gcloud** - [Install Guide](https://cloud.google.com/sdk/docs/install)
- **twilio-cli** - [Install Guide](https://www.twilio.com/docs/twilio-cli/quickstart)
- **neonctl** - `npm install -g neonctl`
- **ngrok** - [Download](https://ngrok.com/download)

### Accounts Needed

You'll need accounts for:

1. **Neon** - [neon.tech](https://neon.tech) (Free tier available)
2. **Firebase** - [console.firebase.google.com](https://console.firebase.google.com) (Free tier available)
3. **Google Cloud** - [console.cloud.google.com](https://console.cloud.google.com) (Requires billing, but APIs are free)
4. **Twilio** - [twilio.com](https://www.twilio.com) (Trial available)
5. **Vercel** - [vercel.com](https://vercel.com) (Free tier available) - Optional

## How to Run

### Step 1: Make Script Executable

```bash
chmod +x bootstrap.sh
```

### Step 2: Run the Script

```bash
./bootstrap.sh
```

### Step 3: Follow Interactive Prompts

The script will:

1. **Check prerequisites** - Install missing tools if you approve
2. **Validate project** - Ensure you're in the correct directory
3. **Setup services** - Walk you through each service configuration
4. **Pause when needed** - Wait for you to complete manual steps (like OAuth consent screens)
5. **Generate secrets** - Create secure random keys automatically
6. **Create database** - Run Prisma migrations
7. **Deploy (optional)** - Push to Vercel if you want

### What to Expect

- The script will **open browser windows** when you need to complete OAuth flows
- You'll be **prompted to paste values** (API keys, secrets) when needed
- It's **safe to re-run** - existing values won't be overwritten unless you confirm
- It's **idempotent** - you can stop and restart without issues

## Interactive Steps

During the script, you'll need to complete these manual steps:

### 1. Firebase Setup
- **Create project** (if new): Name it, disable Analytics if desired
- **Enable auth providers**: Email/Password + Google
- **Download service account JSON**: For Admin SDK

### 2. Google Cloud Setup
- **Configure OAuth consent screen**: App name, scopes, test users
- **Create OAuth credentials**: Add redirect URIs

### 3. Twilio Setup
- **Copy auth token** from console
- **Purchase phone number** (or provide existing one)

### 4. Vercel Deployment (Optional)
- **Link project** to your Vercel account
- **Confirm deployment** to production

## Generated Files

After running, you'll have:

```
.env.local                    # All your environment variables
.env.example                  # Template without secrets
scripts/
  sync-local.sh              # Manually trigger sync job
  set-twilio-webhook.sh      # Update Twilio webhook URL
.ngrok.pid                   # ngrok process ID (if used)
```

## Common Issues & Fixes

### Issue: "Command not found: firebase"

**Fix:**
```bash
npm install -g firebase-tools
```

### Issue: "Command not found: gcloud"

**Fix:** Install Google Cloud SDK:
```bash
# macOS
brew install --cask google-cloud-sdk

# Linux
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

### Issue: "Google OAuth redirect mismatch"

**Symptom:** OAuth error about redirect URI not matching

**Fix:**
1. Go to Google Cloud Console > Credentials
2. Edit your OAuth client
3. Ensure these are in Authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
   - `https://your-domain.vercel.app/api/auth/google/callback` (for production)

### Issue: "Firebase Admin private key error"

**Symptom:** Error about invalid private key format

**Fix:** Ensure the private key includes newlines:
```bash
# Correct format in .env.local:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"
```

### Issue: "Database connection failed"

**Fix:**
1. Verify connection string in `.env.local`
2. Ensure `sslmode=require` is appended
3. Check Neon project is active at [console.neon.tech](https://console.neon.tech)

### Issue: "Twilio webhook not receiving messages"

**Fix for local development:**
```bash
# Make sure ngrok is running
ngrok http 3000

# Update webhook URL in Twilio console with ngrok URL
./scripts/set-twilio-webhook.sh https://YOUR-NGROK-URL.ngrok.io
```

**Fix for production:**
```bash
./scripts/set-twilio-webhook.sh https://your-domain.vercel.app
```

### Issue: "Prisma Client not generated"

**Fix:**
```bash
npm run prisma generate
npm run prisma db push
```

### Issue: Script hangs or freezes

**Fix:**
- Press `Ctrl+C` to cancel
- Script is safe to re-run
- Existing configurations will be preserved

## Post-Setup Commands

### Start Development Server

```bash
npm run dev
# or
pnpm dev
```

Visit: http://localhost:3000

### Manually Trigger Sync

```bash
./scripts/sync-local.sh
```

### View Database

```bash
npm run prisma studio
```

Opens at: http://localhost:5555

### Update Twilio Webhook

```bash
# For production
./scripts/set-twilio-webhook.sh https://your-app.vercel.app

# For ngrok
./scripts/set-twilio-webhook.sh https://abc123.ngrok.io
```

### Deploy to Vercel

```bash
vercel --prod
```

### Re-run Specific Setup Steps

If you need to reconfigure a specific service:

```bash
# The script will detect existing values and ask before overwriting
./bootstrap.sh
```

Then answer "yes" when prompted about reconfiguring that service.

## Environment Variables Reference

The script generates these environment variables:

### Database
```bash
DATABASE_URL="postgresql://..."
```

### Firebase Client (Public)
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
```

### Firebase Admin (Private)
```bash
FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""
```

### Google OAuth
```bash
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### Twilio
```bash
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_FROM_NUMBER=""
```

### Security Secrets (Auto-generated)
```bash
CRON_SECRET=""              # For protecting sync endpoint
WEBHOOK_SIGNING_SECRET=""   # For webhook validation
ENCRYPTION_KEY=""           # For encrypting OAuth tokens
NEXTAUTH_SECRET=""          # For NextAuth sessions
```

### App Config
```bash
NEXTAUTH_URL="http://localhost:3000"
```

## Testing Your Setup

After bootstrap completes, test each integration:

### 1. Test Authentication
```bash
npm run dev
# Visit http://localhost:3000/login
# Try: Email/Password signup, Google Sign-In, Demo mode
```

### 2. Test Google Calendar
```bash
# In dashboard > Settings > Google Calendar
# Click "Connect" → Complete OAuth → Add calendar IDs
# Create a test event in Google Calendar
# Wait 5 minutes or run: ./scripts/sync-local.sh
# Check dashboard > Reservations for the event
```

### 3. Test Google Sheets
```bash
# Create a Google Sheet with "Appointments" tab
# Share with your Firebase service account email
# In dashboard > Settings > Google Sheets
# Paste spreadsheet URL → Save
# Create reservation in dashboard → Check sheet
```

### 4. Test Twilio SMS
```bash
# In dashboard > Settings > Twilio
# Should show "Connected" with your number
# Create a reservation with SMS notification
# Check your phone for the message
# Send SMS to your Twilio number
# Check dashboard > Messages for inbound message
```

## Vercel Production Checklist

After deploying to Vercel:

- [ ] Add production redirect URI to Google OAuth
- [ ] Add production domain to Firebase Authorized domains
- [ ] Update Twilio webhook to production URL
- [ ] Verify all environment variables are set in Vercel
- [ ] Test OAuth flow on production domain
- [ ] Verify cron job is configured (check Vercel dashboard)
- [ ] Monitor first sync job in Vercel logs

## Troubleshooting Workflow

If something doesn't work:

1. **Check logs:**
   ```bash
   # Local
   npm run dev
   # Check terminal output

   # Production
   # Check Vercel dashboard > Logs
   ```

2. **Verify environment variables:**
   ```bash
   cat .env.local | grep "^[A-Z]" | sort
   ```

3. **Test database connection:**
   ```bash
   npm run prisma studio
   ```

4. **Re-run bootstrap for specific service:**
   ```bash
   ./bootstrap.sh
   # Answer "yes" to reconfigure specific service
   ```

5. **Check service consoles:**
   - Firebase: https://console.firebase.google.com
   - Google Cloud: https://console.cloud.google.com
   - Twilio: https://console.twilio.com
   - Neon: https://console.neon.tech
   - Vercel: https://vercel.com

## Getting Help

If you encounter issues:

1. Check this README's "Common Issues & Fixes" section
2. Review the main [SETUP.md](./SETUP.md) guide
3. Check [PHASE2_SUMMARY.md](./PHASE2_SUMMARY.md) for architecture details
4. Create an issue on GitHub

## Cleaning Up

To start fresh:

```bash
# Remove environment file (CAUTION: This deletes all your configs)
rm .env.local

# Stop ngrok if running
kill $(cat .ngrok.pid)
rm .ngrok.pid

# Re-run bootstrap
./bootstrap.sh
```

## Security Notes

- **Never commit `.env.local`** to git (it's in `.gitignore`)
- **Never share your secrets** publicly
- **Rotate secrets regularly** in production
- **Use separate accounts** for development and production

## Advanced: Headless/Non-Interactive Mode

For CI/CD pipelines, you can pre-populate `.env.local` and run:

```bash
# Set all required env vars first
export DATABASE_URL="..."
export FIREBASE_PROJECT_ID="..."
# ... etc

# Then run bootstrap (it will skip already-set values)
./bootstrap.sh
```

---

**Ready to bootstrap?** Just run:

```bash
chmod +x bootstrap.sh
./bootstrap.sh
```

The script will guide you through everything! 🚀
