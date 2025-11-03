# Cloudflare Tunnel Setup

This project can be hosted locally using Cloudflare Tunnel, which creates a public URL for your local development server.

## Quick Start

### Option 1: Use the provided script (Recommended)

```bash
./start-tunnel.sh
```

This will:
1. Start a local HTTP server on port 8000
2. Create a Cloudflare Tunnel
3. Display the public URL

### Option 2: Manual Setup

#### Step 1: Start Local Server

In one terminal:
```bash
python3 -m http.server 8000
```

Or if you have Node.js:
```bash
npx http-server -p 8000
```

#### Step 2: Create Cloudflare Tunnel

In another terminal:
```bash
cloudflared tunnel --url http://localhost:8000
```

The tunnel will output a URL like:
```
https://random-subdomain.trycloudflare.com
```

## Installing Cloudflare Tunnel

If you don't have `cloudflared` installed:

### macOS (using Homebrew)
```bash
brew install cloudflared
```

### Linux
```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
```

### Windows
Download from: https://github.com/cloudflare/cloudflared/releases

## Stopping the Tunnel

Press `Ctrl+C` in the terminal where the tunnel is running. If using the script, it will stop both the server and tunnel automatically.

## Notes

- The tunnel URL changes each time you restart (unless you set up a named tunnel)
- The tunnel is free and doesn't require a Cloudflare account
- Perfect for sharing your local development with others
- Works even behind firewalls/NAT

