# Primetrade — Next.js + Express + MongoDB

Full-stack app with JWT auth, protected dashboard, and entity CRUD. Frontend is Next.js 14 with Tailwind; backend is Express + Mongoose.

## Structure
```
Frontend Project Primetrade/
├── backend/             # Express API (JWT auth, entities, dashboard)
├── frontend-nextjs/     # Next.js app (app router)
├── docker-compose.yml   # Mongo + backend + frontend
├── DOCKER.md            # Docker-specific guide
```

## Quick Start (Docker)
Prereq: Docker + Docker Compose.

```bash
docker-compose up --build
```
Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api
- MongoDB: localhost:27017 (volume `mongo-data`)

### Stop
```bash
docker-compose down       # remove containers, keep volumes
docker-compose down -v    # also delete volumes/data
```

## Local Dev (without Docker)
Backend:
```bash
cd backend
cp .env.example .env   # create and edit values
npm install
npm run dev            # http://localhost:5000
```

Frontend:
```bash
cd frontend-nextjs
npm install
npm run dev            # http://localhost:3000
# If backend not on 5000, set NEXT_PUBLIC_API_BASE accordingly
```

## Environment Variables
Backend (`backend/.env`):
```
MONGO_URI=mongodb://localhost:27017/primetrade   # or mongo:27017 in Docker
JWT_SECRET=replace_me
PORT=5000
FRONTEND_URL=http://localhost:3000
# Optional OAuth:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=
```

Frontend (Next.js):
- `NEXT_PUBLIC_API_BASE` (default: `http://localhost:5000/api`; in Docker compose it is set to `http://localhost:5001/api` for the browser).

## API Overview
- `POST /api/auth/register` — `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`
- `GET /api/dashboard` — auth required, returns user info
- `GET /api/entities` — list (supports `search`, `status`, `sortBy`, `sortOrder`)
- `POST /api/entities` — create `{ name, owner, status? }`
- `PUT /api/entities/:id` — update
- `DELETE /api/entities/:id` — delete

## Frontend Notes
- Icons: Material Symbols via Google Fonts; logout uses PNG at `public/icons/logout.png`.
- Background: Vanta waves (three.js + vanta) lazy-loaded; gradient fallback can be added if needed.
- Auth: JWT stored in `localStorage`; axios interceptor adds `Authorization: Bearer <token>`.

## Troubleshooting
- Frontend can’t reach backend: ensure `NEXT_PUBLIC_API_BASE` matches the exposed backend URL (5001 in Docker).
- Mongo connection: verify `MONGO_URI` (use `mongo` hostname in Docker).
- Ports busy: adjust `ports` in `docker-compose.yml` and update `NEXT_PUBLIC_API_BASE`.

## Next Steps (suggested)
- Add validation (e.g., joi/zod) on create/update entity
- Add rate limiting
- Add tests (backend + frontend)
- CI pipeline for lint/test/build
