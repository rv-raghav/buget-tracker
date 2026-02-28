# Deployment Guide

## Architecture

```
           Vercel (Free)              Render (Free)           Neon (Free)
┌─────────────────────────┐    ┌──────────────────────┐    ┌────────────┐
│   Frontend (React)      │───▶│   Backend (Express)  │───▶│ PostgreSQL │
│   client/ → Static      │    │   server/ → Node.js  │    │            │
│   VITE_API_URL ──────────────▶   PORT, CORS_ORIGIN  │    │ DATABASE_URL│
└─────────────────────────┘    └──────────────────────┘    └────────────┘
```

All three services have **free tiers** that work forever for personal projects.

---

## Prerequisites

- GitHub repository with your code pushed
- Accounts on [Vercel](https://vercel.com), [Render](https://render.com), and [Neon](https://neon.tech)
- Your Neon `DATABASE_URL` (already have this)

---

## Step 1: Deploy Database (Neon) ✅

Already done! Your Neon PostgreSQL is live with the schema migrated.

---

## Step 2: Deploy Backend (Render)

### Option A: One-Click via render.yaml

1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render detects `render.yaml` automatically
6. Set the environment variables when prompted:
   - `DATABASE_URL` → your Neon connection string
   - `CORS_ORIGIN` → leave blank for now (set after frontend deploys)

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `budgetflow-api` |
| **Region** | Oregon (or closest) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...` (your Neon URL) |
| `PORT` | `10000` |
| `CORS_ORIGIN` | (set after step 3) |
| `NODE_ENV` | `production` |

6. Click **Deploy** — wait ~2-3 minutes
7. Note your API URL (e.g. `https://budgetflow-api.onrender.com`)

---

## Step 3: Deploy Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

5. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://budgetflow-api.onrender.com/api` |

   *(Replace with your actual Render URL from Step 2)*

6. Click **Deploy** — wait ~1-2 minutes
7. Note your frontend URL (e.g. `https://budgetflow.vercel.app`)

---

## Step 4: Update CORS

Go back to **Render Dashboard** → your service → **Environment**:

| Key | Value |
|-----|-------|
| `CORS_ORIGIN` | `https://budgetflow.vercel.app` |

*(Replace with your actual Vercel URL from Step 3)*

Render will auto-redeploy with the new CORS setting.

---

## Step 5: Verify

1. Visit your Vercel URL
2. Create a salary cycle
3. Add some expenses
4. Check all pages work

---

## Important Notes

### Render Free Tier
- Spins down after 15 min of inactivity
- First request after sleep takes ~30-50 seconds (cold start)
- 750 free hours/month

### Vercel Free Tier
- Unlimited static hosting
- 100 GB bandwidth/month
- Automatic HTTPS + CDN

### Neon Free Tier
- 0.5 GB storage
- Auto-suspends after 5 min idle
- 191 hours compute/month

### Custom Domain (optional)
Both Vercel and Render support custom domains on free tier:
- Vercel: Settings → Domains → Add
- Render: Settings → Custom Domain → Add

---

## Redeployment

Both Vercel and Render auto-deploy on every push to `main`. Just:
```bash
git add .
git commit -m "your changes"
git push origin main
```
