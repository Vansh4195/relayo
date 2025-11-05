# Step-by-Step: Deploy to GitHub + Cloudflare Pages

## Step 1: Configure Git (One-time setup)

Run these commands in Terminal (replace with YOUR info):

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Or use temporary values for now:**
```bash
git config user.name "Relayo"
git config user.email "deploy@relayo.org"
```

---

## Step 2: Create GitHub Repository

1. Go to **https://github.com** and sign in (or create account)
2. Click the **"+"** icon (top right) → **"New repository"**
3. Settings:
   - **Repository name**: `relayo` (or `relayo-website`)
   - **Description**: "Relayo - AI that books jobs and makes you money"
   - **Visibility**: ✅ **Public** (Cloudflare Pages free tier requires public repos)
   - ⚠️ **DO NOT** check "Add a README file"
   - ⚠️ **DO NOT** check "Add .gitignore"
   - ⚠️ **DO NOT** check "Choose a license"
4. Click **"Create repository"**

---

## Step 3: Push Files to GitHub

After creating the repo, GitHub will show you commands. Run these in Terminal:

```bash
cd /Users/mac/Desktop/Relayo

# Make sure we're in the right directory
pwd

# Check git status
git status

# Add all files (already done, but verify)
git add .

# Create initial commit
git commit -m "Initial commit - Relayo website"

# Add GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/relayo.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note**: GitHub will ask for your username and password. Use a **Personal Access Token** instead of password:
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Name it: "Cloudflare Pages"
- Check "repo" scope
- Copy the token and use it as password when pushing

---

## Step 4: Deploy to Cloudflare Pages

1. Go to **https://dash.cloudflare.com/**
2. Click **"Workers & Pages"** in left sidebar
3. Click **"Create application"**
4. Click **"Pages"** tab
5. Click **"Connect to Git"**
6. Click **"Connect GitHub"** (or GitLab/Bitbucket if you used those)
7. Authorize Cloudflare:
   - Click "Authorize Cloudflare" 
   - Select your repository scope
   - Click "Install & Authorize"
8. Select your `relayo` repository
9. Click **"Begin setup"**
10. Configure settings:
    - **Project name**: `relayo` (auto-filled)
    - **Production branch**: `main`
    - **Framework preset**: None (or leave default)
    - **Build command**: (leave EMPTY - it's a static site)
    - **Build output directory**: `/` (root directory)
    - **Root directory**: `/` (leave default)
11. Click **"Save and Deploy"**
12. Wait 1-2 minutes for deployment to complete ✅

---

## Step 5: Connect Your Domain (relayo.org)

1. After deployment finishes, click on your project name
2. Go to **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter: `relayo.org`
5. Cloudflare will:
   - Automatically configure DNS (CNAME record)
   - Set up SSL certificate (free)
   - Enable HTTPS
6. Wait 1-2 minutes for DNS propagation
7. ✅ Your site is live at **https://relayo.org**!

---

## Step 6: Verify Deployment

Visit these URLs:
- **Pages URL**: `https://relayo.pages.dev` (temporary Cloudflare URL)
- **Custom domain**: `https://relayo.org` (your domain)

---

## Future Updates

Every time you make changes:

```bash
cd /Users/mac/Desktop/Relayo
git add .
git commit -m "Your update description"
git push
```

Cloudflare will **automatically redeploy** in ~2 minutes! 🚀

---

## Troubleshooting

**Issue: "Build failed"**
- Make sure "Build command" is EMPTY
- Check that "Build output directory" is `/`

**Issue: "Domain not connecting"**
- Check DNS settings in Cloudflare Dashboard → relayo.org → DNS
- Make sure CNAME record exists pointing to your Pages URL

**Issue: "Can't push to GitHub"**
- Use Personal Access Token instead of password
- Make sure repo is public (Cloudflare Pages requirement)

---

Need help? Check Cloudflare Pages docs: https://developers.cloudflare.com/pages/



