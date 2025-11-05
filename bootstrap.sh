#!/bin/bash

# =============================================================================
# Relayo Bootstrap Script - Automated Setup for Phase 2 Integrations
# =============================================================================
# This script wires up:
#   - Neon Postgres database
#   - Firebase Authentication
#   - Google Calendar + Sheets OAuth
#   - Twilio SMS
#   - Vercel deployment (optional)
#
# Safe to re-run. Will preserve existing values and prompt before overwriting.
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
WRENCH="🔧"
KEY="🔑"
DATABASE="🗄️"
FIRE="🔥"
CLOUD="☁️"
PHONE="📱"
WARN="⚠️"

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}${1}${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}${CHECK} ${1}${NC}"
}

print_error() {
  echo -e "${RED}${CROSS} ${1}${NC}"
}

print_warning() {
  echo -e "${YELLOW}${WARN} ${1}${NC}"
}

print_info() {
  echo -e "${CYAN}ℹ ${1}${NC}"
}

prompt_continue() {
  echo ""
  echo -e "${YELLOW}Press Enter to continue...${NC}"
  read -r
}

ask_yes_no() {
  local prompt="$1"
  local default="${2:-n}"

  if [ "$default" = "y" ]; then
    prompt="$prompt [Y/n]: "
  else
    prompt="$prompt [y/N]: "
  fi

  read -p "$prompt" response
  response=${response:-$default}

  if [[ "$response" =~ ^[Yy]$ ]]; then
    return 0
  else
    return 1
  fi
}

command_exists() {
  command -v "$1" >/dev/null 2>&1
}

open_url() {
  local url="$1"
  if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$url"
  else
    xdg-open "$url" 2>/dev/null || echo -e "${YELLOW}Please open: ${url}${NC}"
  fi
}

# =============================================================================
# Environment Variable Management
# =============================================================================

ENV_FILE=".env.local"

ensure_env_file() {
  if [ ! -f "$ENV_FILE" ]; then
    print_info "Creating $ENV_FILE..."
    touch "$ENV_FILE"
  fi
}

get_env_value() {
  local key="$1"
  if [ -f "$ENV_FILE" ]; then
    grep "^${key}=" "$ENV_FILE" | cut -d '=' -f 2- | tr -d '"' || true
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"
  local force="${3:-no}"

  ensure_env_file

  # Check if key already exists
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    if [ "$force" = "no" ]; then
      print_info "$key already set, skipping..."
      return 0
    fi
    # Update existing
    if [[ "$OSTYPE" == "darwin"* ]]; then
      sed -i '' "s|^${key}=.*|${key}=\"${value}\"|" "$ENV_FILE"
    else
      sed -i "s|^${key}=.*|${key}=\"${value}\"|" "$ENV_FILE"
    fi
  else
    # Add new
    echo "${key}=\"${value}\"" >> "$ENV_FILE"
  fi

  print_success "Set $key"
}

generate_secret() {
  openssl rand -hex 32
}

# =============================================================================
# Prerequisites Check
# =============================================================================

check_prerequisites() {
  print_header "${WRENCH} Checking Prerequisites"

  local missing=()

  # Check OS
  print_info "Detected OS: $OSTYPE"

  # Check Node.js
  if command_exists node; then
    local node_version=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$node_version" -ge 18 ]; then
      print_success "Node.js $(node -v)"
    else
      print_error "Node.js version must be 18 or higher (found $(node -v))"
      exit 1
    fi
  else
    missing+=("node")
  fi

  # Check package manager
  if command_exists pnpm; then
    print_success "pnpm $(pnpm -v)"
    PKG_MANAGER="pnpm"
  elif command_exists npm; then
    print_success "npm $(npm -v)"
    PKG_MANAGER="npm"
  else
    missing+=("npm")
  fi

  # Check git
  if command_exists git; then
    print_success "git $(git --version | cut -d ' ' -f 3)"
  else
    missing+=("git")
  fi

  # Check jq
  if command_exists jq; then
    print_success "jq $(jq --version)"
  else
    missing+=("jq")
  fi

  # Check openssl
  if command_exists openssl; then
    print_success "openssl"
  else
    missing+=("openssl")
  fi

  # If anything is missing, offer to install
  if [ ${#missing[@]} -gt 0 ]; then
    print_warning "Missing required tools: ${missing[*]}"

    if [[ "$OSTYPE" == "darwin"* ]]; then
      if ask_yes_no "Install missing tools with Homebrew?" "y"; then
        for tool in "${missing[@]}"; do
          brew install "$tool"
        done
      else
        print_error "Please install missing tools and re-run this script"
        exit 1
      fi
    else
      print_error "Please install missing tools: ${missing[*]}"
      exit 1
    fi
  fi

  # Check optional CLIs (will offer to install later if needed)
  print_info "Checking optional CLIs..."

  command_exists firebase && print_success "firebase-tools" || print_warning "firebase-tools not installed (will be needed)"
  command_exists vercel && print_success "vercel" || print_warning "vercel not installed (optional)"
  command_exists gcloud && print_success "gcloud" || print_warning "gcloud not installed (will be needed)"
  command_exists twilio && print_success "twilio-cli" || print_warning "twilio-cli not installed (will be needed)"
  command_exists ngrok && print_success "ngrok" || print_warning "ngrok not installed (optional)"
  command_exists neonctl && print_success "neonctl" || print_warning "neonctl not installed (optional)"

  echo ""
  if ask_yes_no "Install missing optional CLIs now?" "y"; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      ! command_exists firebase && npm install -g firebase-tools
      ! command_exists vercel && npm install -g vercel
      ! command_exists twilio && brew tap twilio/brew && brew install twilio
      ! command_exists ngrok && brew install ngrok/ngrok/ngrok
      ! command_exists neonctl && npm install -g neonctl
    else
      ! command_exists firebase && npm install -g firebase-tools
      ! command_exists vercel && npm install -g vercel
      ! command_exists twilio && print_warning "Install twilio-cli manually: https://www.twilio.com/docs/twilio-cli/quickstart"
      ! command_exists ngrok && print_warning "Install ngrok manually: https://ngrok.com/download"
      ! command_exists neonctl && npm install -g neonctl
    fi
  fi

  # For gcloud, special handling
  if ! command_exists gcloud; then
    print_warning "Google Cloud SDK not installed"
    print_info "Install from: https://cloud.google.com/sdk/docs/install"
    prompt_continue
  fi
}

# =============================================================================
# Project Validation
# =============================================================================

validate_project() {
  print_header "${WRENCH} Validating Project"

  # Check if we're in the project root
  if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
  fi

  print_success "Found package.json"

  # Check for Prisma schema
  if [ ! -f "prisma/schema.prisma" ]; then
    print_error "prisma/schema.prisma not found. Is this a Relayo project?"
    exit 1
  fi

  print_success "Found Prisma schema"

  # Create env file if needed
  ensure_env_file
  print_success "Environment file ready: $ENV_FILE"

  # Generate secrets if not exist
  if [ -z "$(get_env_value CRON_SECRET)" ]; then
    set_env_value "CRON_SECRET" "$(generate_secret)"
  fi

  if [ -z "$(get_env_value WEBHOOK_SIGNING_SECRET)" ]; then
    set_env_value "WEBHOOK_SIGNING_SECRET" "$(generate_secret)"
  fi

  if [ -z "$(get_env_value ENCRYPTION_KEY)" ]; then
    local enc_key=$(openssl rand -base64 32)
    set_env_value "ENCRYPTION_KEY" "$enc_key"
  fi

  if [ -z "$(get_env_value NEXTAUTH_SECRET)" ]; then
    local auth_secret=$(openssl rand -base64 32)
    set_env_value "NEXTAUTH_SECRET" "$auth_secret"
  fi

  set_env_value "NEXTAUTH_URL" "http://localhost:3000"

  print_success "Secure secrets generated"
}

# =============================================================================
# Neon Postgres Setup
# =============================================================================

setup_neon() {
  print_header "${DATABASE} Setting Up Neon Postgres"

  # Check if DATABASE_URL already set
  local existing_db=$(get_env_value DATABASE_URL)
  if [ -n "$existing_db" ]; then
    print_success "DATABASE_URL already configured"
    if ! ask_yes_no "Do you want to reconfigure it?" "n"; then
      return 0
    fi
  fi

  if command_exists neonctl; then
    print_success "neonctl found"

    if ask_yes_no "Create a new Neon database project?" "y"; then
      print_info "Logging into Neon..."
      neonctl auth login

      echo ""
      read -p "Enter a name for your Neon project (e.g., relayo-prod): " project_name
      project_name=${project_name:-relayo-prod}

      print_info "Creating Neon project: $project_name"
      neonctl projects create --name "$project_name" --region aws-us-east-2

      # Get the connection string
      print_info "Fetching connection string..."
      local db_url=$(neonctl connection-string --project-id "$project_name" 2>/dev/null || true)

      if [ -z "$db_url" ]; then
        print_warning "Couldn't automatically fetch connection string"
        print_info "Please copy your connection string from the Neon console"
        open_url "https://console.neon.tech"
        read -p "Paste your DATABASE_URL: " db_url
      fi

      # Ensure sslmode=require
      if [[ ! "$db_url" =~ sslmode=require ]]; then
        db_url="${db_url}?sslmode=require"
      fi

      set_env_value "DATABASE_URL" "$db_url" "yes"
      print_success "Neon database configured!"
    fi
  else
    print_warning "neonctl not installed"
    print_info "Creating database manually..."
    echo ""
    print_info "1. Go to https://console.neon.tech"
    print_info "2. Create a new project"
    print_info "3. Copy the connection string (PostgreSQL)"
    echo ""
    open_url "https://console.neon.tech"
    prompt_continue

    echo ""
    read -p "Paste your DATABASE_URL: " db_url

    if [ -n "$db_url" ]; then
      # Ensure sslmode=require
      if [[ ! "$db_url" =~ sslmode=require ]]; then
        db_url="${db_url}?sslmode=require"
      fi
      set_env_value "DATABASE_URL" "$db_url" "yes"
      print_success "Database configured!"
    else
      print_error "No DATABASE_URL provided"
      exit 1
    fi
  fi
}

# =============================================================================
# Firebase Authentication Setup
# =============================================================================

setup_firebase() {
  print_header "${FIRE} Setting Up Firebase Authentication"

  if ! command_exists firebase; then
    print_error "firebase-tools not installed. Install with: npm install -g firebase-tools"
    exit 1
  fi

  # Login
  print_info "Logging into Firebase..."
  firebase login

  echo ""
  print_info "Firebase projects setup:"
  print_info "1. Create a new Firebase project"
  print_info "2. Use an existing project"
  echo ""

  if ask_yes_no "Create a new Firebase project?" "y"; then
    read -p "Enter Firebase project ID (lowercase, hyphens allowed): " project_id

    print_info "Please create the project manually (Firebase CLI doesn't support creation)"
    print_info "1. Go to https://console.firebase.google.com"
    print_info "2. Click 'Add project'"
    print_info "3. Use project ID: $project_id"
    print_info "4. Disable Google Analytics (optional)"
    echo ""
    open_url "https://console.firebase.google.com"
    prompt_continue
  else
    firebase projects:list
    read -p "Enter your Firebase project ID: " project_id
  fi

  if [ -z "$project_id" ]; then
    print_error "No project ID provided"
    exit 1
  fi

  # Use the project
  firebase use "$project_id"
  print_success "Using Firebase project: $project_id"

  # Enable Auth providers
  print_info "Enable Authentication providers:"
  print_info "1. Go to Firebase Console > Authentication > Sign-in method"
  print_info "2. Enable 'Email/Password'"
  print_info "3. Enable 'Google'"
  echo ""
  open_url "https://console.firebase.google.com/project/$project_id/authentication/providers"
  prompt_continue

  # Get Web App config
  print_info "Getting Web App configuration..."

  # Check if web app exists
  local app_list=$(firebase apps:list --project "$project_id" 2>/dev/null || true)

  if ! echo "$app_list" | grep -q "WEB"; then
    print_info "Creating Web App..."
    read -p "Enter app nickname (e.g., Relayo Web): " app_nickname
    app_nickname=${app_nickname:-Relayo Web}

    firebase apps:create WEB "$app_nickname" --project "$project_id"
  fi

  # Get SDK config
  print_info "Fetching Firebase config..."
  local config_output=$(firebase apps:sdkconfig WEB --project "$project_id" 2>/dev/null || true)

  if [ -n "$config_output" ]; then
    # Parse config (this is tricky, might need manual input)
    print_info "Parsing Firebase config..."

    # Try to extract values
    local api_key=$(echo "$config_output" | grep "apiKey" | cut -d '"' -f 4)
    local auth_domain=$(echo "$config_output" | grep "authDomain" | cut -d '"' -f 4)
    local project_id_config=$(echo "$config_output" | grep "projectId" | cut -d '"' -f 4)
    local storage_bucket=$(echo "$config_output" | grep "storageBucket" | cut -d '"' -f 4)
    local messaging_sender_id=$(echo "$config_output" | grep "messagingSenderId" | cut -d '"' -f 4)
    local app_id=$(echo "$config_output" | grep "appId" | cut -d '"' -f 4)

    if [ -n "$api_key" ]; then
      set_env_value "NEXT_PUBLIC_FIREBASE_API_KEY" "$api_key"
      set_env_value "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$auth_domain"
      set_env_value "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$project_id_config"
      set_env_value "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$storage_bucket"
      set_env_value "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$messaging_sender_id"
      set_env_value "NEXT_PUBLIC_FIREBASE_APP_ID" "$app_id"
      print_success "Firebase client config saved!"
    else
      print_warning "Couldn't parse config automatically"
    fi
  fi

  # If parsing failed, manual entry
  if [ -z "$(get_env_value NEXT_PUBLIC_FIREBASE_API_KEY)" ]; then
    print_info "Please enter Firebase config manually:"
    print_info "Find it at: https://console.firebase.google.com/project/$project_id/settings/general"
    echo ""

    read -p "API Key: " api_key
    read -p "Auth Domain: " auth_domain
    read -p "Project ID: " project_id_input
    read -p "Storage Bucket: " storage_bucket
    read -p "Messaging Sender ID: " messaging_sender_id
    read -p "App ID: " app_id

    set_env_value "NEXT_PUBLIC_FIREBASE_API_KEY" "$api_key"
    set_env_value "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "$auth_domain"
    set_env_value "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "$project_id_input"
    set_env_value "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "$storage_bucket"
    set_env_value "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "$messaging_sender_id"
    set_env_value "NEXT_PUBLIC_FIREBASE_APP_ID" "$app_id"
  fi

  # Admin SDK credentials
  print_info ""
  print_info "Setting up Firebase Admin SDK..."
  print_info "1. Go to Project Settings > Service Accounts"
  print_info "2. Click 'Generate new private key'"
  print_info "3. Download the JSON file"
  echo ""
  open_url "https://console.firebase.google.com/project/$project_id/settings/serviceaccounts/adminsdk"
  prompt_continue

  echo ""
  print_info "Enter the path to your service account JSON file:"
  read -p "Path: " service_account_path

  if [ -f "$service_account_path" ]; then
    local project_id_admin=$(jq -r '.project_id' "$service_account_path")
    local client_email=$(jq -r '.client_email' "$service_account_path")
    local private_key=$(jq -r '.private_key' "$service_account_path")

    set_env_value "FIREBASE_PROJECT_ID" "$project_id_admin"
    set_env_value "FIREBASE_CLIENT_EMAIL" "$client_email"
    set_env_value "FIREBASE_PRIVATE_KEY" "$private_key"

    print_success "Firebase Admin SDK configured!"
  else
    print_warning "File not found. Please enter manually:"
    read -p "Client Email: " client_email
    echo "Private Key (paste entire key including BEGIN/END lines, then press Ctrl+D):"
    private_key=$(cat)

    set_env_value "FIREBASE_PROJECT_ID" "$project_id"
    set_env_value "FIREBASE_CLIENT_EMAIL" "$client_email"
    set_env_value "FIREBASE_PRIVATE_KEY" "$private_key"
  fi
}

# =============================================================================
# Google Cloud OAuth Setup
# =============================================================================

setup_google_oauth() {
  print_header "${CLOUD} Setting Up Google Cloud OAuth"

  if ! command_exists gcloud; then
    print_error "gcloud CLI not installed"
    print_info "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
  fi

  # Login
  print_info "Logging into Google Cloud..."
  gcloud auth login

  # Select or create project
  echo ""
  gcloud projects list
  echo ""

  if ask_yes_no "Create a new GCP project?" "n"; then
    read -p "Enter project ID (lowercase, hyphens): " gcp_project_id
    gcloud projects create "$gcp_project_id"
    gcloud config set project "$gcp_project_id"

    print_warning "You may need to enable billing for this project"
    open_url "https://console.cloud.google.com/billing"
    prompt_continue
  else
    read -p "Enter existing project ID: " gcp_project_id
    gcloud config set project "$gcp_project_id"
  fi

  print_success "Using GCP project: $gcp_project_id"

  # Enable APIs
  print_info "Enabling Google Calendar API..."
  gcloud services enable calendar-json.googleapis.com --project="$gcp_project_id"

  print_info "Enabling Google Sheets API..."
  gcloud services enable sheets.googleapis.com --project="$gcp_project_id"

  print_success "APIs enabled!"

  # OAuth Consent Screen
  print_info ""
  print_info "Configure OAuth Consent Screen:"
  print_info "1. Go to APIs & Services > OAuth consent screen"
  print_info "2. Choose 'External' (or Internal if using Workspace)"
  print_info "3. Fill in app name: Relayo"
  print_info "4. Add scopes: calendar, sheets"
  print_info "5. Add test users if in testing mode"
  echo ""
  open_url "https://console.cloud.google.com/apis/credentials/consent?project=$gcp_project_id"
  prompt_continue

  # OAuth Client
  print_info ""
  print_info "Create OAuth 2.0 Client ID:"
  print_info "1. Go to APIs & Services > Credentials"
  print_info "2. Click 'Create Credentials' > 'OAuth client ID'"
  print_info "3. Application type: Web application"
  print_info "4. Name: Relayo Web Client"
  print_info "5. Authorized JavaScript origins: http://localhost:3000"
  print_info "6. Authorized redirect URIs:"
  print_info "   - http://localhost:3000/api/auth/google/callback"
  echo ""
  open_url "https://console.cloud.google.com/apis/credentials?project=$gcp_project_id"
  prompt_continue

  echo ""
  read -p "Paste your OAuth Client ID: " google_client_id
  read -p "Paste your OAuth Client Secret: " google_client_secret

  set_env_value "GOOGLE_CLIENT_ID" "$google_client_id"
  set_env_value "GOOGLE_CLIENT_SECRET" "$google_client_secret"
  set_env_value "GOOGLE_REDIRECT_URI" "http://localhost:3000/api/auth/google/callback"

  print_success "Google OAuth configured!"
}

# =============================================================================
# Twilio SMS Setup
# =============================================================================

setup_twilio() {
  print_header "${PHONE} Setting Up Twilio SMS"

  if ! command_exists twilio; then
    print_error "twilio-cli not installed"
    print_info "Install from: https://www.twilio.com/docs/twilio-cli/quickstart"
    exit 1
  fi

  # Login
  print_info "Logging into Twilio..."
  twilio login

  # Get account info
  print_info "Fetching account info..."
  local account_sid=$(twilio api:core:accounts:list --properties sid --no-header 2>/dev/null | head -1 | tr -d ' ')

  if [ -n "$account_sid" ]; then
    print_success "Account SID: $account_sid"
    set_env_value "TWILIO_ACCOUNT_SID" "$account_sid"
  else
    read -p "Enter your Twilio Account SID: " account_sid
    set_env_value "TWILIO_ACCOUNT_SID" "$account_sid"
  fi

  # Auth token
  print_info ""
  print_info "Get your Auth Token from: https://console.twilio.com"
  open_url "https://console.twilio.com"
  read -p "Paste your Auth Token: " auth_token
  set_env_value "TWILIO_AUTH_TOKEN" "$auth_token"

  # Phone number
  echo ""
  if ask_yes_no "Do you have a Twilio phone number already?" "n"; then
    read -p "Enter your Twilio phone number (format: +1234567890): " phone_number
    set_env_value "TWILIO_FROM_NUMBER" "$phone_number"
  else
    print_info "Searching for available phone numbers..."
    twilio api:core:available-phone-numbers:local:list --country-code US --sms-enabled --limit 5

    echo ""
    if ask_yes_no "Buy one of these numbers?" "y"; then
      read -p "Enter the phone number to purchase (format: +1234567890): " phone_number

      print_info "Purchasing $phone_number..."
      twilio api:core:incoming-phone-numbers:create --phone-number "$phone_number"

      set_env_value "TWILIO_FROM_NUMBER" "$phone_number"
      print_success "Phone number purchased!"
    else
      print_info "Purchase a number at: https://console.twilio.com/us1/develop/phone-numbers/manage/search"
      open_url "https://console.twilio.com/us1/develop/phone-numbers/manage/search"
      prompt_continue

      read -p "Enter your Twilio phone number: " phone_number
      set_env_value "TWILIO_FROM_NUMBER" "$phone_number"
    fi
  fi

  print_success "Twilio configured!"

  # Webhook setup
  local phone_number=$(get_env_value TWILIO_FROM_NUMBER)

  echo ""
  if command_exists ngrok && ask_yes_no "Set up local webhook with ngrok?" "n"; then
    print_info "Starting ngrok..."
    ngrok http 3000 > /dev/null &
    local ngrok_pid=$!

    sleep 3

    local ngrok_url=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

    if [ -n "$ngrok_url" ]; then
      print_success "ngrok running at: $ngrok_url"

      local webhook_url="${ngrok_url}/api/webhooks/twilio-sms"

      print_info "Setting Twilio webhook..."
      twilio api:core:incoming-phone-numbers:update \
        --phone-number "$phone_number" \
        --sms-url "$webhook_url" \
        --sms-method POST

      print_success "Webhook configured: $webhook_url"

      echo "$ngrok_pid" > .ngrok.pid
      print_info "ngrok PID saved to .ngrok.pid (kill with: kill \$(cat .ngrok.pid))"
    else
      print_warning "Couldn't get ngrok URL"
    fi
  else
    print_info ""
    print_info "To configure webhook later, set it to:"
    print_info "https://YOUR-DOMAIN/api/webhooks/twilio-sms"
    print_info ""
    print_info "Configure at: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming"
  fi
}

# =============================================================================
# Prisma & Database Migration
# =============================================================================

setup_database() {
  print_header "${DATABASE} Setting Up Database Schema"

  # Install dependencies
  print_info "Installing dependencies..."
  $PKG_MANAGER install

  # Generate Prisma Client
  print_info "Generating Prisma Client..."
  $PKG_MANAGER prisma generate

  # Push schema to database
  print_info "Pushing schema to database..."

  if ask_yes_no "Run 'prisma db push' to create tables?" "y"; then
    $PKG_MANAGER prisma db push
    print_success "Database schema created!"
  else
    print_warning "Skipping database push. Run manually: $PKG_MANAGER prisma db push"
  fi

  # Offer to open Prisma Studio
  if ask_yes_no "Open Prisma Studio to view database?" "n"; then
    $PKG_MANAGER prisma studio &
    print_info "Prisma Studio opening at http://localhost:5555"
  fi
}

# =============================================================================
# Local Development
# =============================================================================

start_local() {
  print_header "${ROCKET} Starting Local Development Server"

  print_info "Your app is configured! Here's what to do next:"
  echo ""
  print_info "1. Start the dev server:"
  print_success "   $PKG_MANAGER dev"
  echo ""
  print_info "2. Visit http://localhost:3000"
  echo ""
  print_info "3. Log in with Firebase (email/password or Google)"
  echo ""
  print_info "4. Go to Settings and connect:"
  print_success "   - Google Calendar (complete OAuth in app)"
  print_success "   - Google Sheets (paste spreadsheet URL)"
  print_success "   - Twilio (already configured via env vars)"
  echo ""
  print_info "5. Test features:"
  print_success "   - Create a reservation"
  print_success "   - Check Google Calendar for the event"
  print_success "   - Check Google Sheets for the entry"
  print_success "   - Send/receive SMS"
  echo ""

  if ask_yes_no "Start dev server now?" "y"; then
    print_success "Starting server..."
    $PKG_MANAGER dev
  fi
}

# =============================================================================
# Vercel Deployment
# =============================================================================

deploy_vercel() {
  print_header "${ROCKET} Deploying to Vercel"

  if ! command_exists vercel; then
    print_warning "vercel CLI not installed"
    if ask_yes_no "Install now?" "y"; then
      npm install -g vercel
    else
      print_info "Skipping Vercel deployment"
      return 0
    fi
  fi

  if ! ask_yes_no "Deploy to Vercel now?" "n"; then
    print_info "Skipping deployment. You can deploy later with: vercel --prod"
    return 0
  fi

  # Login
  print_info "Logging into Vercel..."
  vercel login

  # Link project
  print_info "Linking project..."
  vercel link

  # Deploy environment variables
  print_info "Setting environment variables..."

  if [ -f "$ENV_FILE" ]; then
    while IFS= read -r line; do
      if [[ "$line" =~ ^([A-Z_]+)=\"?([^\"]*)\"?$ ]]; then
        local key="${BASH_REMATCH[1]}"
        local value="${BASH_REMATCH[2]}"

        echo "$value" | vercel env add "$key" production --force
        print_success "Set $key"
      fi
    done < "$ENV_FILE"
  fi

  # Deploy
  print_info "Deploying to production..."
  local deploy_output=$(vercel --prod 2>&1)
  local prod_url=$(echo "$deploy_output" | grep -o 'https://[^ ]*\.vercel\.app' | head -1)

  if [ -n "$prod_url" ]; then
    print_success "Deployed to: $prod_url"

    # Update environment variables for production
    echo "$prod_url/api/auth/google/callback" | vercel env add GOOGLE_REDIRECT_URI production --force
    echo "$prod_url" | vercel env add NEXTAUTH_URL production --force

    # Instructions
    print_info ""
    print_info "Post-deployment steps:"
    print_warning "1. Add redirect URI to Google OAuth:"
    print_info "   $prod_url/api/auth/google/callback"
    print_info "   At: https://console.cloud.google.com/apis/credentials"
    echo ""
    print_warning "2. Add domain to Firebase Authorized domains:"
    print_info "   ${prod_url#https://}"
    print_info "   At: https://console.firebase.google.com"
    echo ""
    print_warning "3. Update Twilio webhook URL:"
    print_info "   $prod_url/api/webhooks/twilio-sms"
    print_info "   At: https://console.twilio.com"
    echo ""

    if [ -f "vercel.json" ] && grep -q "crons" "vercel.json"; then
      print_success "Cron job configured in vercel.json"
    else
      print_warning "Don't forget to add cron job for sync!"
      print_info "Add to vercel.json:"
      print_info '{
  "crons": [{
    "path": "/api/sync/run",
    "schedule": "*/5 * * * *"
  }]
}'
    fi
  else
    print_error "Deployment failed or URL not found"
  fi
}

# =============================================================================
# Generate Helper Scripts
# =============================================================================

generate_scripts() {
  print_header "${WRENCH} Generating Helper Scripts"

  mkdir -p scripts

  # Sync script
  cat > scripts/sync-local.sh << 'EOF'
#!/bin/bash
source .env.local
curl "http://localhost:3000/api/sync/run?key=$CRON_SECRET"
EOF
  chmod +x scripts/sync-local.sh
  print_success "Created scripts/sync-local.sh"

  # Twilio webhook script
  cat > scripts/set-twilio-webhook.sh << 'EOF'
#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./scripts/set-twilio-webhook.sh <base-url>"
  echo "Example: ./scripts/set-twilio-webhook.sh https://your-app.vercel.app"
  exit 1
fi

source .env.local
BASE_URL="$1"
WEBHOOK_URL="${BASE_URL}/api/webhooks/twilio-sms"

twilio api:core:incoming-phone-numbers:update \
  --phone-number "$TWILIO_FROM_NUMBER" \
  --sms-url "$WEBHOOK_URL" \
  --sms-method POST

echo "✅ Webhook set to: $WEBHOOK_URL"
EOF
  chmod +x scripts/set-twilio-webhook.sh
  print_success "Created scripts/set-twilio-webhook.sh"

  # .env.example
  if [ -f "$ENV_FILE" ]; then
    grep -o '^[A-Z_]*=' "$ENV_FILE" | sed 's/=$/=""/' > .env.example
    print_success "Created .env.example"
  fi
}

# =============================================================================
# Final Summary
# =============================================================================

print_summary() {
  print_header "${ROCKET} Setup Complete!"

  echo ""
  print_success "Your Relayo dashboard is configured and ready!"
  echo ""

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Configuration Summary${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  local db_url=$(get_env_value DATABASE_URL)
  if [ -n "$db_url" ]; then
    local masked_db="${db_url:0:20}...${db_url: -20}"
    echo -e "${GREEN}${DATABASE} Database:${NC} $masked_db"
  fi

  local firebase_project=$(get_env_value NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  if [ -n "$firebase_project" ]; then
    echo -e "${GREEN}${FIRE} Firebase:${NC} $firebase_project"
  fi

  local google_client=$(get_env_value GOOGLE_CLIENT_ID)
  if [ -n "$google_client" ]; then
    echo -e "${GREEN}${CLOUD} Google OAuth:${NC} ${google_client:0:30}..."
  fi

  local twilio_number=$(get_env_value TWILIO_FROM_NUMBER)
  if [ -n "$twilio_number" ]; then
    echo -e "${GREEN}${PHONE} Twilio:${NC} $twilio_number"
  fi

  echo ""
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Quick Commands${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Start dev server:${NC}"
  echo "  $PKG_MANAGER dev"
  echo ""
  echo -e "${YELLOW}Trigger sync manually:${NC}"
  echo "  ./scripts/sync-local.sh"
  echo ""
  echo -e "${YELLOW}Update Twilio webhook:${NC}"
  echo "  ./scripts/set-twilio-webhook.sh <base-url>"
  echo ""
  echo -e "${YELLOW}View database:${NC}"
  echo "  $PKG_MANAGER prisma studio"
  echo ""
  echo -e "${YELLOW}Deploy to Vercel:${NC}"
  echo "  vercel --prod"
  echo ""

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Documentation${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "${YELLOW}Setup Guide:${NC} SETUP.md"
  echo -e "${YELLOW}Implementation Details:${NC} PHASE2_SUMMARY.md"
  echo -e "${YELLOW}Bootstrap Guide:${NC} README_BOOTSTRAP.md"
  echo ""

  print_success "Happy building! 🎉"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
  clear

  echo ""
  echo -e "${MAGENTA}"
  echo "  ╦═╗╔═╗╦  ╔═╗╦ ╦╔═╗"
  echo "  ╠╦╝║╣ ║  ╠═╣╚╦╝║ ║"
  echo "  ╩╚═╚═╝╩═╝╩ ╩ ╩ ╚═╝"
  echo -e "${NC}"
  echo -e "${CYAN}  Automated Bootstrap Script${NC}"
  echo -e "${CYAN}  Phase 2 Integration Setup${NC}"
  echo ""

  print_warning "This script will configure:"
  echo "  • Neon Postgres"
  echo "  • Firebase Authentication"
  echo "  • Google Calendar + Sheets OAuth"
  echo "  • Twilio SMS"
  echo "  • Vercel deployment (optional)"
  echo ""

  if ! ask_yes_no "Continue?" "y"; then
    print_info "Exiting. Run again when ready!"
    exit 0
  fi

  # Run setup steps
  check_prerequisites
  validate_project
  setup_neon
  setup_firebase
  setup_google_oauth
  setup_twilio
  setup_database
  generate_scripts

  # Optional: Deploy to Vercel
  if ask_yes_no "Deploy to Vercel?" "n"; then
    deploy_vercel
  fi

  # Summary
  print_summary

  # Offer to start dev server
  echo ""
  if ask_yes_no "Start local development server?" "y"; then
    start_local
  else
    print_info "Start server manually: $PKG_MANAGER dev"
  fi
}

# Run main function
main "$@"
