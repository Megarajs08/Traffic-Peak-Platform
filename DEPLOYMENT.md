# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security ✅
- [x] Google OAuth secrets removed from `.env`
- [ ] Add Google OAuth credentials to deployment platform (Vercel/Railway)
- [ ] All secrets in environment variables only

### 2. Build Test
```bash
# Test production build
pnpm run build

# Verify outputs
ls artifacts/traffic-peak/dist/  # Frontend build
ls artifacts/api-server/dist/    # API build
```

### 3. Environment Variables Setup

**For Vercel (Frontend):**
```
VITE_API_URL=https://your-api.railway.app
```

**For Railway (API):**
```
NODE_ENV=production
DATABASE_URL=/app/data/prod.db
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://your-api.railway.app/api/auth/google/callback
FRONTEND_URL=https://your-frontend.vercel.app
API_PORT=4000
```

## Deployment Options

### Option A: Vercel (Frontend) + Railway (API) [RECOMMENDED]

#### Step 1: Deploy API to Railway
1. Push to GitHub
2. Go to [railway.app](https://railway.app)
3. New Project → GitHub repo
4. Select repo
5. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=/app/data/prod.db
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   GOOGLE_REDIRECT_URI=https://YOUR-RAILWAY-DOMAIN/api/auth/google/callback
   FRONTEND_URL=https://YOUR-VERCEL-DOMAIN.vercel.app
   ```
6. Dockerfile: Already configured ✅
7. Deploy!

#### Step 2: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import GitHub project
3. Environment Variables:
   ```
   VITE_API_URL=https://YOUR-RAILWAY-DOMAIN
   ```
4. Build settings already in `vercel.json` ✅
5. Deploy!

### Option B: Railway Only (Monorepo)

1. Railway new project → GitHub repo
2. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=/app/data/prod.db
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   GOOGLE_REDIRECT_URI=https://YOUR-RAILWAY-DOMAIN/api/auth/google/callback
   FRONTEND_URL=https://YOUR-RAILWAY-DOMAIN
   ```
3. Dockerfile handles both frontend + API build
4. Expose ports: 4000 (API) + 3000 (Frontend)

## Post-Deployment

### Verify
- [ ] Frontend loads at your domain
- [ ] API responds at `/api/health`
- [ ] Database file persists (check Railway volumes)
- [ ] Google OAuth login works

### Database Migration
If switching from SQLite to PostgreSQL:

```bash
# 1. Export data (if needed)
sqlite3 lib/db/db/dev.db ".dump" > backup.sql

# 2. Update DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# 3. Redeploy
# Drizzle auto-migrates on startup
```

## Monitoring

- Railway dashboard for logs
- Vercel analytics
- Monitor Database size (SQLite grows with traffic)

## Cost Estimate (Monthly)

| Service | Free Tier | Paid |
|---------|-----------|------|
| Vercel  | Generous  | $20+ |
| Railway | $5 credit | $5-50+ |
| Total   | ~Free     | $25-70 |

**Note:** Switch to PostgreSQL if SQLite hits performance issues.
