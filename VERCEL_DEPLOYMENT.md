# Vercel Deployment Guide for Primetrade

This project can be deployed to Vercel with two deployment strategies:

## 🎯 Deployment Options

### Option 1: Frontend on Vercel + Backend on Vercel (Serverless) ⭐ Recommended
- **Frontend**: Deploy Next.js app directly to Vercel
- **Backend**: Convert Express routes to Vercel serverless functions
- **Database**: MongoDB Atlas (cloud-hosted)

### Option 2: Frontend on Vercel + Backend on Separate Platform
- **Frontend**: Deploy Next.js app to Vercel
- **Backend**: Deploy Express API to Railway/Render/Heroku
- **Database**: MongoDB Atlas

---

## 🚀 Option 1: Full Vercel Deployment (Recommended)

### Prerequisites
- Vercel account ([sign up](https://vercel.com))
- MongoDB Atlas account ([sign up](https://www.mongodb.com/cloud/atlas))

### Step 1: Setup MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist IP `0.0.0.0/0` (or Vercel's IP ranges)
4. Copy your connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/primetrade`)

### Step 2: Deploy Frontend to Vercel

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend-nextjs directory**:
   ```bash
   cd frontend-nextjs
   vercel
   ```

   Or use Vercel Dashboard:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Set root directory to `frontend-nextjs`
   - Add environment variable: `NEXT_PUBLIC_API_BASE=https://your-backend-url.vercel.app/api`

3. **Environment Variables** (in Vercel Dashboard → Settings → Environment Variables):
   ```
   NEXT_PUBLIC_API_BASE=https://your-backend-url.vercel.app/api
   ```

### Step 3: Convert Backend to Vercel Serverless Functions

The backend needs to be restructured for Vercel's serverless architecture. You'll need to:

1. **Create `api/` directory in frontend-nextjs**:
   ```
   frontend-nextjs/
   ├── api/
   │   ├── auth/
   │   │   ├── register.js
   │   │   └── login.js
   │   ├── dashboard/
   │   │   └── index.js
   │   └── entities/
   │       ├── index.js
   │       └── [id].js
   ```

2. **Convert Express routes to serverless functions** (each route becomes a separate function)

3. **Add `vercel.json`** to configure routes:
   ```json
   {
     "functions": {
       "api/**/*.js": {
         "maxDuration": 10
       }
     },
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "/api/:path*"
       }
     ]
   }
   ```

**Note**: This requires significant refactoring. See "Alternative: Deploy Backend Separately" below for easier option.

---

## 🚀 Option 2: Frontend on Vercel + Backend on Railway/Render

### Step 1: Deploy Frontend to Vercel

1. **Deploy frontend**:
   ```bash
   cd frontend-nextjs
   vercel
   ```

2. **Set environment variable**:
   ```
   NEXT_PUBLIC_API_BASE=https://your-backend.railway.app/api
   ```
   (or your backend URL)

### Step 2: Deploy Backend to Railway (Recommended)

1. **Create Railway account**: [railway.app](https://railway.app)

2. **Create new project** → Deploy from GitHub

3. **Select backend directory** as root

4. **Add environment variables**:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/primetrade
   JWT_SECRET=your_secret_key_here
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

5. **Railway will auto-deploy** and provide a URL like `https://your-app.railway.app`

6. **Update frontend** `NEXT_PUBLIC_API_BASE` to point to Railway URL

### Alternative: Deploy Backend to Render

1. **Create Render account**: [render.com](https://render.com)

2. **Create Web Service** → Connect GitHub repo

3. **Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Environment Variables**:
   ```
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=...
   PORT=5000
   ```

---

## 📋 Quick Deploy Checklist

### Frontend (Vercel)
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Set root directory: `frontend-nextjs`
- [ ] Add env var: `NEXT_PUBLIC_API_BASE`
- [ ] Deploy

### Backend (Railway/Render)
- [ ] Setup MongoDB Atlas
- [ ] Deploy backend to Railway/Render
- [ ] Add env vars (MONGO_URI, JWT_SECRET)
- [ ] Copy backend URL
- [ ] Update frontend `NEXT_PUBLIC_API_BASE`

### Database
- [ ] Create MongoDB Atlas cluster
- [ ] Whitelist IPs (0.0.0.0/0 for development)
- [ ] Copy connection string

---

## 🔧 Environment Variables Reference

### Frontend (Vercel)
```
NEXT_PUBLIC_API_BASE=https://your-backend-url.com/api
```

### Backend (Railway/Render)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/primetrade
JWT_SECRET=your_secure_secret_key_min_32_chars
PORT=5000
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_BASE` is set correctly
- Ensure backend URL includes `/api` if needed
- Verify CORS settings in backend allow your Vercel domain

### MongoDB connection errors
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Check connection string format
- Ensure database user has correct permissions

### Build failures
- Check Node.js version compatibility (Vercel uses Node 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)

---

## 💡 Recommended Setup

**For easiest deployment:**
1. Frontend → Vercel (automatic Next.js optimization)
2. Backend → Railway (simple Express deployment)
3. Database → MongoDB Atlas (free tier available)

This combination provides:
- ✅ Fast global CDN for frontend
- ✅ Simple backend deployment
- ✅ Managed database
- ✅ Free tiers available for all services

