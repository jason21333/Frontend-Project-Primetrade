# Frontend Project Primetrade — MERN Stack

Welcome! This repository contains a scalable web application with authentication and a protected dashboard, built with the **MERN Stack** (MongoDB, Express, React, Node.js).

## 🎯 What You Get

- ✅ **Backend API** — Express.js + MongoDB with user authentication
- ✅ **Frontend App** — React + Vite with protected routes
- ✅ **Docker Setup** — One command to run everything locally
- ✅ **JWT Authentication** — Secure token-based user sessions
- ✅ **Scalable Architecture** — Ready for production deployment

## 📦 What's Inside

```
/
├── mern-app/                 # Main MERN application
│   ├── backend/              # Express API (port 5000)
│   ├── frontend/             # React app (port 5173)
│   ├── docker-compose.yml    # Docker orchestration
│   ├── README.md             # Detailed setup guide
│   └── DOCKER.md             # Docker-specific instructions
└── README.md                 # This file
```

## 🚀 Get Started in 30 Seconds

### Option 1: With Docker (Recommended)

```bash
cd mern-app
docker-compose up -d --build

# Open browser to http://localhost:5173
# Register → Login → View Dashboard
```

### Option 2: Manual Setup

**Backend:**
```bash
cd mern-app/backend
npm install
npm run dev
```

**Frontend (new terminal):**
```bash
cd mern-app/frontend
npm install
npm run dev
```

---

## 📖 Documentation

- **[mern-app/README.md](mern-app/README.md)** — Full project documentation, API endpoints, deployment guides
- **[mern-app/DOCKER.md](mern-app/DOCKER.md)** — Docker-specific setup and troubleshooting
- **[mern-app/backend/README.md](mern-app/backend/README.md)** — Backend API details
- **[mern-app/frontend/README.md](mern-app/frontend/README.md)** — Frontend setup

---

## 🔐 Features

### Authentication
- User registration with email & password
- Login with JWT token generation
- Password hashing with bcryptjs
- 7-day token expiration

### Authorization
- Protected dashboard route (requires valid token)
- Automatic redirect to login for unauthorized access
- Token stored in localStorage

### API
- RESTful endpoints for auth & dashboard
- CORS enabled for development
- Mongoose schema validation

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Axios, React Router |
| Backend | Express.js, Node.js |
| Database | MongoDB 7 |
| Auth | JWT, bcryptjs |
| DevOps | Docker, Docker Compose |

---

## 🌐 Deployment

Ready to deploy?

- **Frontend:** Vercel, Netlify, AWS S3 + CloudFront
- **Backend:** Heroku, Railway, Render, AWS Lambda
- **Database:** MongoDB Atlas (free tier available)
- **Full Stack:** Docker to AWS ECS, Google Cloud Run, Azure Container Instances

See [mern-app/README.md](mern-app/README.md#-deployment) for step-by-step deployment guides.

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| Port already in use | Change port in docker-compose.yml |
| MongoDB connection error | Verify MongoDB URI in .env |
| CORS errors | Check API_BASE_URL in frontend |
| Build fails | Run `docker system prune -a` |

---

## 📋 Project Status

- [x] Backend setup (Express + MongoDB)
- [x] Frontend setup (React + Vite)
- [x] Authentication routes (register, login)
- [x] Protected dashboard
- [x] Docker configuration
- [ ] Email verification (future)
- [ ] Refresh token rotation (future)
- [ ] Rate limiting (future)

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -m "add my feature"`
3. Push to branch: `git push origin feature/my-feature`
4. Open a Pull Request

---

## 📄 License

MIT

---

**Questions?** Check the detailed README in the `mern-app/` directory or see `DOCKER.md` for Docker-specific help.

**Ready to run?**
```bash
cd mern-app
docker-compose up -d --build
```

🎉 Your app is running at http://localhost:5173!
