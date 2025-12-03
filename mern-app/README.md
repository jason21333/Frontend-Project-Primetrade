# MERN App — Scalable Web App with Authentication & Dashboard

A complete **MERN Stack** project (MongoDB, Express, React, Node.js) with:
- ✅ User Authentication (Register / Login with JWT)
- ✅ Protected Dashboard (token-based access)
- ✅ Scalable Backend API
- ✅ React Frontend with Vite
- ✅ Docker & Docker Compose for local development
- ✅ MongoDB Atlas ready

## 📁 Project Structure

```
mern-app/
├── backend/                  # Express + Mongoose API
│   ├── controllers/
│   ├── models/              # User schema
│   ├── middleware/          # JWT auth middleware
│   ├── routes/              # Auth & Dashboard routes
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── .env.example
│   └── README.md
├── frontend/                # Vite + React
│   ├── src/
│   │   ├── pages/           # Login, Register, Dashboard
│   │   ├── main.jsx
│   │   ├── api.js           # Axios client
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   ├── index.html
│   └── README.md
├── docker-compose.yml       # Orchestrates all services
├── .dockerignore
└── DOCKER.md               # Docker setup guide
```

## 🚀 Quick Start with Docker

**Prerequisites:** Docker & Docker Compose installed ([Get Docker](https://docs.docker.com/get-docker/))

### 1. Start All Services

```bash
cd mern-app
docker-compose up -d --build
```

**Services will be available at:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017 (user: `root`, password: `password`)

### 2. Test the App

1. Open http://localhost:5173 in your browser
2. Click **Register** and create an account
3. Login with your credentials
4. View your protected dashboard

### 3. Stop Services

```bash
# Stop but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop, remove containers, and delete all data
docker-compose down -v
```

---

## 🛠️ Manual Local Setup (without Docker)

### Backend

```bash
cd backend
cp .env.example .env

# Edit .env with your MongoDB URI and JWT_SECRET
nano .env

npm install
npm run dev
```

Backend runs on **http://localhost:5000**

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## 📚 API Endpoints

### Authentication

- **POST** `/api/auth/register`  
  Body: `{ name, email, password }`  
  Response: `{ token, user: { id, name, email } }`

- **POST** `/api/auth/login`  
  Body: `{ email, password }`  
  Response: `{ token, user: { id, name, email } }`

### Protected Routes

- **GET** `/api/dashboard`  
  Headers: `Authorization: Bearer <token>`  
  Response: `{ message, userId }`

---

## 🔑 Environment Variables

### Backend (`.env`)

```
MONGO_URI=mongodb://localhost:27017/mern_app
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Frontend (optional `.env`)

```
VITE_API_BASE=http://localhost:5000/api
```

---

## 🔐 Security Notes

- **Development:** JWT_SECRET is set to `your_jwt_secret_key_change_in_prod` in docker-compose.yml — change for production
- **Password Hashing:** Uses bcryptjs with 10 salt rounds
- **Token Expiry:** JWT tokens expire in 7 days
- **CORS:** Enabled for localhost

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Axios, React Router |
| **Backend** | Express.js, Node.js |
| **Database** | MongoDB 7, Mongoose |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Deployment** | Docker & Docker Compose |

---

## 🚢 Deployment

### Option 1: Heroku + MongoDB Atlas (Recommended)

```bash
# 1. Create MongoDB Atlas cluster at https://www.mongodb.com/cloud/atlas
# 2. Copy the connection string
# 3. Deploy backend to Heroku
heroku create your-app-name
heroku config:set MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mern_app
heroku config:set JWT_SECRET=your_production_secret
git push heroku main

# 4. Deploy frontend to Vercel
npm run build
# Upload dist/ to Vercel
```

### Option 2: Docker to Any Cloud (AWS, GCP, Azure, DigitalOcean)

```bash
# Build and tag
docker build -t your-registry/mern-app-backend:latest ./backend
docker build -t your-registry/mern-app-frontend:latest ./frontend

# Push
docker push your-registry/mern-app-backend:latest
docker push your-registry/mern-app-frontend:latest

# Deploy with your cloud provider's orchestration (ECS, GKE, ACI, etc.)
```

---

## 📝 Development Workflow

1. **Make changes** in `backend/` or `frontend/`
2. **Hot reload:** Vite dev server and nodemon will auto-reload
3. **Commit:** `git add . && git commit -m "your message"`
4. **Push:** `git push origin main`

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000/5173 already in use | Kill process or change port in docker-compose.yml |
| MongoDB connection refused | Ensure MongoDB is running; check MONGO_URI |
| CORS errors | Update VITE_API_BASE in frontend or backend CORS config |
| Docker images won't build | Run `docker system prune -a` to clean dangling images |
| Can't login after registration | Clear browser localStorage and retry |

---

## 📄 License

MIT

---

## ✨ Next Steps

- [ ] Add email verification
- [ ] Implement refresh token rotation
- [ ] Add API rate limiting (express-rate-limit)
- [ ] Add request validation (joi or zod)
- [ ] Add unit/integration tests
- [ ] Setup GitHub Actions CI/CD
- [ ] Add websockets for real-time features
- [ ] Implement role-based access control (RBAC)

---

**Happy coding!** 🎉 (Auth + Dashboard)

A small scaffold with:
- Backend: Express + MongoDB (Mongoose), JWT auth
- Frontend: Vite + React, simple login/register + protected dashboard

Getting started

1. Start MongoDB locally (or provide `MONGO_URI` pointing to a cloud MongoDB).
2. Backend:

```bash
cd mern-app/backend
cp .env.example .env
# edit .env to set MONGO_URI and JWT_SECRET
npm install
npm run dev
```

3. Frontend:

```bash
cd mern-app/frontend
npm install
npm run dev
```

By default fronted expects backend at `http://localhost:5000/api`. Set `VITE_API_BASE` if different.
