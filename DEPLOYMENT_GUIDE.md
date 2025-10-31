# JobJäger - Deployment Guide

**Last Updated:** 2025-10-31

## 🚀 Quick Deployment (Step-by-Step)

### Prerequisites
- GitHub account (to push code)
- Render account (free tier) - https://render.com
- Vercel account (free tier) - https://vercel.com
- Anthropic API key - https://console.anthropic.com

---

## Part 1: Prepare Repository (10 minutes)

### 1. Initialize Git (if not already done)
```bash
cd /home/imran/Desktop/project
git init
git add .
git commit -m "Initial commit - JobJäger MVP ready for deployment"
```

### 2. Create GitHub Repository
1. Go to https://github.com/new
2. Name: `jobjager` or `job-application-manager`
3. Description: "AI-powered job application manager for the German job market"
4. **Keep it Public** (for portfolio visibility)
5. **Don't** initialize with README (you already have one)
6. Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/jobjager.git
git branch -M main
git push -u origin main
```

---

## Part 2: Deploy Backend to Render (20 minutes)

### 1. Sign up for Render
- Go to https://render.com
- Sign up with GitHub account
- Click "Authorize Render"

### 2. Create PostgreSQL Database
1. Click **"New +"** → **"PostgreSQL"**
2. Settings:
   - **Name:** `jobjager-db`
   - **Database:** `jobjager`
   - **User:** `jobjager_user`
   - **Region:** Choose closest to you (Europe for Germany)
   - **Plan:** **Free** ($0/month)
3. Click **"Create Database"**
4. **IMPORTANT:** Copy the **Internal Database URL** (starts with `postgresql://`)

### 3. Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `jobjager`
3. Settings:
   - **Name:** `jobjager-backend`
   - **Region:** Same as database
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build && npx prisma generate && npx prisma migrate deploy`
   - **Start Command:** `npm run start`
   - **Plan:** **Free** ($0/month)

### 4. Add Environment Variables
Click **"Environment"** tab and add:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=<paste-internal-database-url-from-step-2>
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://jobjager.vercel.app
ANTHROPIC_API_KEY=<your-anthropic-api-key>
```

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 5. Deploy
1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Your backend will be at: `https://jobjager-backend.onrender.com`

### 6. Test Backend
```bash
curl https://jobjager-backend.onrender.com/api/health
```
Should return: `{"success":true,"message":"Server is running"}`

---

## Part 3: Deploy Frontend to Vercel (10 minutes)

### 1. Sign up for Vercel
- Go to https://vercel.com
- Sign up with GitHub account
- Click "Authorize Vercel"

### 2. Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your repository: `jobjager`
3. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3. Add Environment Variable
Click **"Environment Variables"** and add:

```
VITE_API_URL=https://jobjager-backend.onrender.com/api
```

### 4. Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Your frontend will be at: `https://jobjager.vercel.app`

### 5. Update Backend CORS
Go back to Render → Your backend service → Environment:
- Update `FRONTEND_URL` to your actual Vercel URL: `https://jobjager.vercel.app`
- Click "Save Changes" (backend will redeploy)

---

## Part 4: Final Testing (5 minutes)

### 1. Test Full Flow
1. Visit `https://jobjager.vercel.app`
2. Register a new account
3. Login
4. Create a CV
5. Create an application
6. Generate an Anschreiben (cover letter)

### 2. Verify Everything Works
- ✅ Registration/Login works
- ✅ Data persists (refresh page)
- ✅ All pages load correctly
- ✅ AI generation works (Anschreiben)

---

## 🎉 You're Live!

Your application is now deployed:
- **Frontend:** https://jobjager.vercel.app
- **Backend API:** https://jobjager-backend.onrender.com
- **Database:** Hosted on Render

---

## 📝 Update Your README

Add these badges and links to your README.md:

```markdown
## 🚀 Live Demo

**Frontend:** https://jobjager.vercel.app
**Backend API:** https://jobjager-backend.onrender.com/api

## 📸 Screenshots

[Add screenshots here]
```

---

## 🔧 Troubleshooting

### Backend won't start?
- Check Render logs: Dashboard → jobjager-backend → Logs
- Verify all environment variables are set
- Ensure DATABASE_URL is the **Internal** URL

### Database connection failed?
- Ensure you copied the **Internal Database URL** (not External)
- Check database is in same region as backend

### Frontend can't connect to backend?
- Verify `VITE_API_URL` matches your Render backend URL
- Check CORS: `FRONTEND_URL` in backend must match Vercel URL
- Rebuild frontend after changing env vars

### AI generation not working?
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check you have credits in Anthropic account

---

## 💰 Costs

**Total Monthly Cost: $0** 🎉

- Render Free Tier:
  - ✅ PostgreSQL (512 MB, 90 days free, then expires)
  - ✅ Web Service (spins down after inactivity, 750 hours/month free)
- Vercel Free Tier:
  - ✅ Unlimited deployments
  - ✅ 100 GB bandwidth

**Note:** Render free tier database expires after 90 days. You'll need to:
- Migrate to paid tier ($7/month), or
- Use Neon PostgreSQL (serverless, stays free)

---

## 🔄 Future Deployments

### Deploy Backend Updates
```bash
git add .
git commit -m "Update backend"
git push
```
Render auto-deploys on push!

### Deploy Frontend Updates
```bash
git add .
git commit -m "Update frontend"
git push
```
Vercel auto-deploys on push!

---

## 🎯 Next Steps

1. ✅ Add screenshots to README
2. ✅ Test all features live
3. ✅ Share on LinkedIn
4. ✅ Add to resume
5. ✅ Start applying!

---

**Deployment complete! You now have a live, production-ready portfolio project.** 🚀
