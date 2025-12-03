# MERN App (Auth + Dashboard)

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
