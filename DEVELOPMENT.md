# Development Guide

This guide explains how to run, build, and stop your development stack using Docker Compose, plus handy commands and troubleshooting tips.

## Prerequisites

- Docker Desktop running on Windows
- WSL integration enabled for your Ubuntu distro:
  - Docker Desktop → Settings → Resources → WSL Integration → Enable for "Ubuntu" → Apply & Restart
- Project root: `~/Devopes` (inside WSL) or `\\wsl.localhost\Ubuntu\home\pasindu\Devopes` (PowerShell)

## Services and Ports

- Frontend (CRA dev server): http://localhost:3000
- Backend (Express API): http://localhost:4000
- MongoDB: mongodb://localhost:27017/ordoro (from host); inside containers use `mongodb://mongodb:27017/ordoro`

Compose file for development: `docker-compose.dev.yml`

---

## Start (development)

Recommended: run in WSL (Ubuntu)

```bash
# WSL
cd ~/Devopes
# Build images and start containers (foreground)
docker compose -f docker-compose.dev.yml up --build
```

PowerShell (alternative):

```powershell
# PowerShell
Set-Location \\wsl.localhost\Ubuntu\home\pasindu\Devopes
# Build images and start containers (foreground)
docker compose -f docker-compose.dev.yml up --build
```

Start in background (detached):

```bash
# WSL or PowerShell
docker compose -f docker-compose.dev.yml up --build -d
```

## Build

Rebuild everything:

```bash
docker compose -f docker-compose.dev.yml build
```

Rebuild a single service (examples):

```bash
# Backend only
docker compose -f docker-compose.dev.yml build backend
# Frontend only
docker compose -f docker-compose.dev.yml build frontend
```

Apply the rebuilt service:

```bash
# Start/restart only that service (detached recommended)
docker compose -f docker-compose.dev.yml up -d backend
# or frontend
docker compose -f docker-compose.dev.yml up -d frontend
```

## Stop

Stop containers (keep volumes/data):

```bash
docker compose -f docker-compose.dev.yml down
```

Stop and remove volumes (cleans Mongo data and container node_modules caches):

```bash
docker compose -f docker-compose.dev.yml down -v
```

## Logs and Shell

Follow logs for all services:

```bash
docker compose -f docker-compose.dev.yml logs -f
```

Follow logs for one service:

```bash
docker compose -f docker-compose.dev.yml logs -f backend
# or
docker compose -f docker-compose.dev.yml logs -f frontend
```

Open a shell inside a container:

```bash
# Busybox/Alpine usually has sh
docker compose -f docker-compose.dev.yml exec backend sh
# For frontend container shell
docker compose -f docker-compose.dev.yml exec frontend sh
```

## Hot Reload

- Frontend (CRA) hot reload works out-of-the-box. Polling is enabled for reliability under Docker/WSL.
- Backend currently uses `npm start` (node). To enable auto-restart on changes, install `nodemon` and change the compose command to `npx nodemon server.js`.

## Troubleshooting

- "docker-compose command not found": use the new v2 syntax `docker compose ...` (with a space).
- Cannot connect to Docker from WSL: ensure Docker Desktop is running and WSL Integration is enabled for Ubuntu.
- Port already in use: stop the process using 3000/4000 or adjust port mappings in `docker-compose.dev.yml`.
- Frontend shows `Unexpected token '<'` in main.*.js: usually the dev server/bundle didnt build correctly. Restart containers and ensure dependencies install cleanly.
- File changes not detected: running inside Docker with polling should help. If still flaky, restart the affected service: `docker compose -f docker-compose.dev.yml up -d frontend`.

## Useful URLs

- Frontend: http://localhost:3000
- Backend health: http://localhost:4000/
- Example API endpoints:
  - POST http://localhost:4000/api/login
  - POST http://localhost:4000/api/register
  - POST http://localhost:4000/api/upload-image (form-data key: `file`)

---

## Alternative: Run frontend locally (no Docker)

If you prefer to run the frontend directly in WSL:

```bash
# One-time: ensure Node LTS is installed with nvm
export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
node -v || nvm install --lts

cd ~/Devopes/Frount-end
rm -rf node_modules package-lock.json
npm install
npm start
```

Open http://localhost:3000. The backend can still run in Docker or locally on port 4000.
