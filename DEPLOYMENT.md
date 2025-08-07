# Split Personality - Railway Deployment Guide

This guide explains how to deploy Split Personality to Railway for free hosting.

## Deployment Architecture

**Single Server Setup:**
- Frontend: Vue 3 SPA served as static files by Express
- Backend: Express.js API with SQLite database
- Database: SQLite with persistent volume on Railway

## Railway Deployment Steps

### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:
```bash
git add .
git commit -m "prep: Configure app for Railway deployment"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `split-personality` repository
5. Railway will automatically detect the configuration

### 3. Configure Environment Variables

In the Railway dashboard, add these environment variables:

**Required:**
```
NODE_ENV=production
DATABASE_URL=file:/app/backend/prisma/production.db
PORT=3001
```

**Optional (for custom domain):**
```
CORS_ORIGIN=https://yourdomain.com
```

### 4. Configure Persistent Storage

1. In Railway dashboard, go to your service
2. Click "Settings" → "Volumes"
3. Add a volume:
   - **Mount Path:** `/app/backend/prisma`
   - **Size:** 1GB (more than enough for SQLite)

This ensures your database persists between deployments.

### 5. Deploy

Railway will automatically:
1. Install dependencies (`npm run install:all`)
2. Build frontend (`npm run build:frontend`)
3. Build backend (`npm run build:backend`)
4. Start the server (`npm run start:production`)

## Build Process

The deployment follows this sequence:

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Build Frontend**
   ```bash
   cd frontend && npm run build
   ```
   - Creates `frontend/dist/` with static files
   - Optimized for production

3. **Build Backend**
   ```bash
   cd backend && npm run build
   ```
   - Compiles TypeScript to `backend/dist/`
   - Includes static file serving configuration

4. **Database Setup**
   - Prisma generates client
   - Database migrations run automatically

5. **Start Production Server**
   ```bash
   NODE_ENV=production cd backend && npm start
   ```

## How It Works

**Single Server Architecture:**
```
Railway Deployment
├── Express.js Server (Port: $PORT)
│   ├── API Routes (/api/*)
│   ├── Static Frontend Files (/*) 
│   └── SQLite Database
└── Persistent Volume (/app/backend/prisma)
```

**Request Flow:**
1. All requests go to Express server
2. `/api/*` routes → Backend API handlers
3. All other routes → Serve `index.html` (Vue SPA)
4. Vue Router handles client-side routing

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Environment mode |
| `PORT` | `3001` | Set by Railway | Server port |
| `DATABASE_URL` | `file:./dev.db` | `file:/app/backend/prisma/production.db` | Database location |
| `CORS_ORIGIN` | `http://localhost:3000` | Your domain | CORS configuration |

## Post-Deployment

### Access Your App
Railway provides a URL like: `https://your-app-name.up.railway.app`

### Database Management
Connect to your Railway deployment for database operations:
```bash
# Using Railway CLI
railway shell
cd backend
npx prisma studio
```

### Monitoring
- Railway dashboard shows logs, metrics, and deployments
- Health check available at: `/api/health`

## Troubleshooting

### Common Issues

**Build Failures:**
- Check Railway build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

**Database Issues:**
- Confirm persistent volume is mounted
- Check `DATABASE_URL` environment variable
- Verify Prisma migrations ran successfully

**Static File 404s:**
- Ensure frontend build completed
- Check `frontend/dist/` directory exists
- Verify Express static file configuration

### Debug Commands

```bash
# Check build output
npm run build:production

# Test production build locally
NODE_ENV=production npm run start:production

# Database status
cd backend && npx prisma db status
```

## Cost Optimization

**Railway Free Tier:**
- $5 credit per month
- Sufficient for moderate usage
- Automatic scaling with usage-based pricing

**Optimization Tips:**
- Use environment variables for configuration
- Monitor resource usage in Railway dashboard
- Consider upgrading for higher traffic

## Security Considerations

**Production Security:**
- Environment variables for sensitive data
- CORS configured for your domain
- Rate limiting enabled
- Helmet.js security headers
- Input validation with Zod

**Database Security:**
- SQLite file permissions
- Household-scoped data access
- No direct database exposure

## Alternative Deployment Options

If Railway doesn't meet your needs:

1. **Render** - Similar free tier, good Railway alternative
2. **Fly.io** - More configuration options, persistent volumes
3. **Vercel + Railway** - Frontend on Vercel, API on Railway
4. **Self-hosted** - VPS with Docker deployment

---

For questions or issues, refer to:
- Railway documentation: [docs.railway.app](https://docs.railway.app)
- This repository's issues page