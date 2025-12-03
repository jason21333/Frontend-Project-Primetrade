# Primetrade - Docker Setup

This project runs locally using Docker Compose (backend, frontend Next.js, MongoDB).

## Requirements

- Docker & Docker Compose installed ([Get Docker](https://docs.docker.com/get-docker/))

## Quick Start

### 1. Create Backend Environment File

Create `backend/.env` file:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set:
- `MONGO_URI=mongodb://mongo:27017/primetrade` (for Docker)
- `JWT_SECRET=your_secret_key_here` (change this!)
- `PORT=5000`
- `FRONTEND_URL=http://localhost:3000`

### 2. Build and Start Services

```bash
docker-compose up --build
```

This will:
- Build MongoDB container
- Build and start backend API
- Build and start Next.js frontend

### 3. Access the Application

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5001/api
- **MongoDB:** localhost:27017

### 4. Test the Application

1. Register a new account at http://localhost:3000/register
2. Login at http://localhost:3000/login
3. View your dashboard at http://localhost:3000/dashboard

## Stopping Services

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers, and delete all data
docker-compose down -v
```

## Environment Variables

### Backend (`backend/.env`)

Required:
- `MONGO_URI`: MongoDB connection string
  - Docker: `mongodb://mongo:27017/primetrade`
  - Local: `mongodb://localhost:27017/primetrade`
- `JWT_SECRET`: Secret key for JWT signing (change for production!)
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for OAuth redirects

Optional (for OAuth):
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `GOOGLE_CALLBACK_URL`: Google OAuth callback URL
- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth client secret
- `GITHUB_CALLBACK_URL`: GitHub OAuth callback URL

### Frontend

The frontend uses `NEXT_PUBLIC_API_BASE` which is set at build time in `docker-compose.yml`:
- Docker: `http://localhost:5001/api` (exposed port for browser requests)
- Local dev: `http://localhost:5000/api`

## Development

### Hot Reload

For development with hot reload, you can run services individually:

**Backend (with nodemon):**
```bash
cd backend
npm install
npm run dev
```

**Frontend (Next.js dev server):**
```bash
cd frontend-nextjs
npm install
npm run dev
```

**MongoDB (Docker):**
```bash
docker-compose up mongo
```

### Rebuilding After Code Changes

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Restart services
docker-compose up -d
```

## Production Build

The Dockerfiles are configured for production:

- **Backend**: Uses production dependencies only
- **Frontend**: Multi-stage build with optimized Next.js production build

### Building Production Images

```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## Troubleshooting

### Port Already in Use

If ports 3000, 5001, or 27017 are already in use:

1. Change ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Change 3000 to 3001
   ```

2. Update `NEXT_PUBLIC_API_BASE` in `docker-compose.yml` if backend port changes

### MongoDB Connection Issues

- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongo`
- Verify `MONGO_URI` in `backend/.env` matches Docker service name: `mongodb://mongo:27017/primetrade`

### Frontend Can't Connect to Backend

- Verify backend is running: `docker-compose logs backend`
- Check `NEXT_PUBLIC_API_BASE` is set correctly in `docker-compose.yml`
- Ensure backend port mapping is correct (5001:5000)

### Build Failures

- Clear Docker cache: `docker-compose build --no-cache`
- Remove old images: `docker system prune -a`
- Check for syntax errors in Dockerfiles

## Docker Compose Services

- **mongo**: MongoDB 6.0 database
- **backend**: Express.js API server (Node.js 18)
- **frontend**: Next.js 14 application (Node.js 18)

All services restart automatically unless stopped manually.
