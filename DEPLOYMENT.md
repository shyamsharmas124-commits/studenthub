# Deployment Guide — StudentHub

Covers **Frontend deployment**, **Backend deployment**, and **Containerization with Docker**.

---

## Containerization with Docker

### Prerequisites
- Docker Desktop installed and running

### Running with Docker Compose (recommended)

```bash
# 1. Copy env file and fill in values
cp server/.env.example server/.env

# 2. Build and start all services
docker-compose up --build

# Services started:
#   client  ? http://localhost:5173
#   server  ? http://localhost:5000
#   mongodb ? localhost:27017 (internal)
```

### Individual Docker builds

```bash
# Backend
cd server
docker build -t studenthub-server .
docker run -p 5000:5000 --env-file .env studenthub-server

# Frontend
cd client
docker build -t studenthub-client .
docker run -p 5173:5173 studenthub-client
```

---

## Frontend Deployment (Vercel / Netlify)

### Vercel (recommended)

1. Push code to GitHub
2. Import repo at vercel.com
3. Set **Root Directory** to `client`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
5. Deploy

### Netlify

1. Import repo at netlify.com
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Set `VITE_API_URL` in Site Settings ? Environment Variables
5. Add `client/_redirects`:
   ```
   /*  /index.html  200
   ```

---

## Backend Deployment (Railway / Render)

### Railway (recommended)

1. Create new project at railway.app
2. Add **MongoDB** plugin (or use MongoDB Atlas)
3. Deploy from GitHub, set root to `server/`
4. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `REDIS_URL` (optional — Railway Redis plugin)
   - `PORT` = `5000`
5. Deploy

### Render

1. Create new **Web Service**
2. Root directory: `server`
3. Build command: `npm install && npx prisma generate`
4. Start command: `node src/index.js`
5. Add all env vars from `.env.example`

---

## Environment Variables Checklist

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ? | MongoDB connection string |
| `JWT_SECRET` | ? | Strong random secret (32+ chars) |
| `PORT` | ? | Server port (default 5000) |
| `REDIS_URL` | ? | Redis for caching (gracefully disabled if missing) |
| `YOUTUBE_API_KEY` | ? | For YouTube course analysis |
| `OPENAI_API_KEY` | ? | For AI quiz generation |
| `CLIENT_URL` | ? | For CORS configuration |

---

## Health Check

After deployment, verify the server is running:

```bash
curl https://your-backend.railway.app/api/health
# {"status":"ok","timestamp":"...","integrations":{...}}
```
