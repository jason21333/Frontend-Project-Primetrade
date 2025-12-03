# MERN App Backend

Simple Express + MongoDB backend for auth + dashboard.

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run dev server:

```bash
npm run dev
```

API Endpoints
- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password }
- `GET /api/dashboard` (Authorization: Bearer <token>)
