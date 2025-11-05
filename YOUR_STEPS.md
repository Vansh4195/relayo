# 🚀 Your Deployment Steps for relayo.org

## ✅ Step 1: Create GitHub Repository (Do this first!)

1. Go to: **https://github.com/new**
2. Fill in:
   - **Repository name**: `relayo`
   - **Description**: "Relayo - AI that books jobs and makes you money" (optional)
   - **Visibility**: ✅ **Public** (required for Cloudflare Pages free tier)
   - ⚠️ **DO NOT** check "Add a README file"
   - ⚠️ **DO NOT** check "Add .gitignore"
   - ⚠️ **DO NOT** check "Choose a license"
3. Click **"Create repository"**

---

## ✅ Step 2: Generate GitHub Personal Access Token

GitHub requires a token instead of password for git push:

1. Go to: **https://github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Settings:
   - **Note**: `Cloudflare Pages`
   - **Expiration**: 90 days (or No expiration)
   - **Scopes**: Check ✅ **repo** (this gives full repository access)
4. Click **"Generate token"**
5. **COPY THE TOKEN** (you won't see it again! It looks like `ghp_xxxxxxxxxxxxx`)

---

## ✅ Step 3: Push Your Code to GitHub

Open Terminal and run:

```bash
cd /Users/mac/Desktop/Relayo
git remote add origin https://github.com/Vansh4195/relayo.git
git push -u origin main
```

When prompted:
- **Username**: `Vansh4195`
- **Password**: Paste your Personal Access Token (from Step 2)

You should see:
```
✅ Enumerating objects...
✅ Writing objects...
✅ To https://github.com/Vansh4195/relayo.git
```

---

## ✅ Step 4: Deploy to Cloudflare Pages

1. Go to: **https://dash.cloudflare.com/**
2. Click **"Workers & Pages"** (left sidebar)
3. Click **"Create application"**
4. Click **"Pages"** tab → **"Connect to Git"**
5. Click **"Connect GitHub"**
6. Authorize:
   - Click **"Authorize Cloudflare"**
   - Select **"All repositories"** or just **"relayo"**
   - Click **"Install & Authorize"**
7. Select your **`relayo`** repository
8. Click **"Begin setup"**
9. Configuration:
   - **Project name**: `relayo` (auto-filled)
   - **Production branch**: `main` ✅
   - **Framework preset**: Leave as "None"
   - **Build command**: (leave **EMPTY** - it's a static site)
   - **Build output directory**: `/` (root directory)
10. Click **"Save and Deploy"**
11. Wait 1-2 minutes ⏳

---

## ✅ Step 5: Connect Your Domain (relayo.org)

1. After deployment finishes, click on your project: **`relayo`**
2. Click **"Custom domains"** tab
3. Click **"Set up a custom domain"**
4. Enter: `relayo.org`
5. Click **"Continue"**
6. Cloudflare will automatically:
   - Configure DNS (CNAME record)
   - Set up SSL certificate (free HTTPS)
   - Enable HTTPS redirect
7. Wait 1-2 minutes for DNS propagation ⏳

---

## ✅ Step 6: Verify It's Live!

Visit:
- **Cloudflare Pages URL**: `https://relayo.pages.dev`
- **Your domain**: `https://relayo.org`

Both should show your website! 🎉

---

## 🔄 Future Updates

Every time you make changes to your website:

```bash
cd /Users/mac/Desktop/Relayo
git add .
git commit -m "Your update description"
git push
```

Cloudflare Pages will **automatically redeploy** in ~2 minutes! 🚀

---

## ❓ Troubleshooting

**"Repository not found"**
→ Make sure the repo name is exactly `relayo` and it's **Public**

**"Authentication failed"**
→ Use Personal Access Token, not your GitHub password

**"Build failed"**
→ Make sure "Build command" is **EMPTY** (not `npm run build`)

**"Domain not working"**
→ Check Cloudflare Dashboard → relayo.org → DNS settings

---

## 📞 Need Help?

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- GitHub Docs: https://docs.github.com/en/get-started

Good luck! 🍀



