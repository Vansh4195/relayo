#!/bin/bash

# Quick deployment script for Relayo
# Run this after making changes to deploy to Cloudflare Pages

echo "🚀 Deploying Relayo to Cloudflare Pages..."
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
  echo "❌ Error: index.html not found. Make sure you're in the Relayo directory."
  exit 1
fi

# Deploy using Wrangler
echo "📤 Uploading files..."
npx wrangler pages deploy . \
  --project-name=relayo \
  --commit-dirty=true

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Deployment successful!"
  echo "🌐 Your site: https://relayo.org"
  echo ""
  echo "📝 Note: If you made git changes, also run:"
  echo "   git add ."
  echo "   git commit -m 'Your update message'"
  echo "   git push"
else
  echo ""
  echo "❌ Deployment failed. Check the error above."
  exit 1
fi
