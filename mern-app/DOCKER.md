# MERN App - Docker Setup

This project runs locally using Docker Compose (backend, frontend, MongoDB).

**Requirements**
- Docker & Docker Compose installed (https://docs.docker.com/get-docker/)

**Quick Start**

```bash
cd mern-app
docker-compose up --build
```

Services will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **MongoDB:** localhost:27017 (user: `root`, password: `password`)

**Workflow**

1. Register a new account at http://localhost:5173/register
2. Login at http://localhost:5173/login
3. View your dashboard at http://localhost:5173/dashboard

**Stopping**

```bash
docker-compose down
```

**Stopping & Cleaning Up Data**

```bash
docker-compose down -v
```

**Environment Variables** (set in `docker-compose.yml`)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing (change for production)
- `VITE_API_BASE`: Frontend API base URL

**Development**

Edit code in `backend/` or `frontend/` and Docker will hot-reload (due to `nodemon` and Vite dev mode).

**Building Production Images**

```bash
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml push
```

(requires Docker registry credentials)
