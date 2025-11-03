# Deployment Guide for relayo.org

## Option 1: GitHub + Cloudflare Pages (Recommended)

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Name it: `relayo` (or any name you like)
4. Make it **Public** (Cloudflare Pages free tier works with public repos)
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

### Step 2: Push Your Files to GitHub

Open Terminal and run these commands:

```bash
cd /Users/mac/Desktop/Relayo

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Relayo website"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/relayo.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** in the left sidebar
3. Click **"Create application"**
4. Click **"Pages"** tab → **"Connect to Git"**
5. Click **"Connect GitHub"** (or GitLab/Bitbucket)
6. Authorize Cloudflare to access your repositories
7. Select your `relayo` repository
8. Click **"Begin setup"**
9. Configure build settings:
   - **Project name**: `relayo` (or any name)
   - **Production branch**: `main`
   - **Build command**: (leave empty - it's a static site)
   - **Build output directory**: `/` (root directory)
10. Click **"Save and Deploy"**

### Step 4: Connect Your Domain

1. After deployment completes, click your project
2. Go to **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter: `relayo.org`
5. Cloudflare will automatically configure DNS and SSL

That's it! Your site will be live at `relayo.org` in a few minutes.

---

## Option 2: Direct Upload to Cloudflare Pages

If you don't want to use GitHub:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** → **"Create application"**
3. Click **"Pages"** tab → **"Upload assets"**
4. Zip your files (excluding .DS_Store, .git, etc.)
5. Drag and drop the zip file
6. Configure:
   - **Project name**: `relayo`
   - **Build output directory**: `/`
7. Click **"Deploy"**
8. Connect domain as in Step 4 above

---

## Updating Your Site

### With GitHub (Option 1):
```bash
git add .
git commit -m "Update website"
git push
```
Cloudflare will automatically redeploy in ~2 minutes.

### With Direct Upload:
Re-upload a new zip file through the Cloudflare dashboard.

---

## Files to Include

Make sure these files are in your deployment:
- ✅ index.html
- ✅ auto.html, wellness.html, home-services.html, dental.html, retail.html
- ✅ styles.css
- ✅ script.js
- ✅ assets/ folder (logos, icons, etc.)

---

## Need Help?

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Support: https://community.cloudflare.com/

