#!/bin/bash

# Helper script to push Relayo website to GitHub

echo "🚀 Relayo - Push to GitHub"
echo ""
echo "Before running this, make sure you've:"
echo "1. Created a GitHub repo at https://github.com/new"
echo "2. Named it 'relayo' and made it PUBLIC"
echo ""

read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
  echo "❌ Username cannot be empty!"
  exit 1
fi

echo ""
echo "📤 Pushing to GitHub..."
echo ""

# Remove existing remote if it exists
git remote remove origin 2>/dev/null

# Add new remote
git remote add origin "https://github.com/${GITHUB_USERNAME}/relayo.git"

# Push to GitHub
echo "Pushing to: https://github.com/${GITHUB_USERNAME}/relayo.git"
git push -u origin main

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Successfully pushed to GitHub!"
  echo ""
  echo "📋 NEXT STEP:"
  echo "   Go to: https://dash.cloudflare.com/"
  echo "   → Workers & Pages → Create application → Pages"
  echo "   → Connect to Git → Select your 'relayo' repo"
  echo ""
else
  echo ""
  echo "❌ Push failed. Make sure:"
  echo "   1. Repository exists at github.com/${GITHUB_USERNAME}/relayo"
  echo "   2. Repository is PUBLIC"
  echo "   3. You have push access"
  echo "   4. You use a Personal Access Token (not password)"
  echo ""
  echo "   Get token: https://github.com/settings/tokens"
fi





