#!/bin/bash

# Start script for Cloudflare Tunnel
# This script starts a local HTTP server and creates a Cloudflare Tunnel

PORT=8000

echo "🚀 Starting local server on port $PORT..."
echo ""

# Start Python HTTP server in the background
python3 -m http.server $PORT > /dev/null 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 1

echo "✅ Local server started (PID: $SERVER_PID)"
echo "🌐 Creating Cloudflare Tunnel..."
echo ""
echo "Your site will be available at: https://[random-subdomain].trycloudflare.com"
echo ""
echo "Press Ctrl+C to stop both the server and tunnel"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping server and tunnel..."
    kill $SERVER_PID 2>/dev/null
    kill $CLOUDFLARE_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Cloudflare Tunnel
cloudflared tunnel --url http://localhost:$PORT &
CLOUDFLARE_PID=$!

# Wait for both processes
wait $SERVER_PID $CLOUDFLARE_PID

