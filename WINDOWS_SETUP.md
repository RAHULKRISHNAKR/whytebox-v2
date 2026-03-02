# WhyteBox v2 — Windows Setup Guide

> **Platform**: Windows 10 / Windows 11 (64-bit)  
> **Estimated setup time**: 5–10 minutes (first run downloads ~100 MB of model weights on demand)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start — One Command](#2-quick-start--one-command)
3. [Manual Setup](#3-manual-setup)
4. [Environment Configuration](#4-environment-configuration)
5. [Running the Application](#5-running-the-application)
6. [Verifying the Installation](#6-verifying-the-installation)
7. [Troubleshooting](#7-troubleshooting)
8. [GPU Acceleration (Optional)](#8-gpu-acceleration-optional)
9. [Docker (Alternative)](#9-docker-alternative)

---

## 1. Prerequisites

### Required Software

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10, 3.11, or 3.12 | https://www.python.org/downloads/ |
| Node.js | 18 LTS or 20 LTS | https://nodejs.org/ |
| Git | Latest | https://git-scm.com/download/win |

> ⚠️ **Python install tip**: During Python installation, check **"Add Python to PATH"** and **"Add Python to environment variables"**. Without this, `python` won't be found in the terminal.

> ⚠️ **Node.js install tip**: Use the LTS (Long Term Support) version. After installing, restart your terminal so `node` and `npm` are available.

---

## 2. Quick Start — One Command

After cloning the repo, just double-click `start.bat` (or run it from Command Prompt):

```cmd
cd WhyteBox\whytebox-v2
start.bat
```

The script will:
1. Check Python and Node.js are installed
2. Create a Python virtual environment (`backend\venv\`) if it doesn't exist
3. Install all Python dependencies from `requirements.txt`
4. Install Node.js dependencies (`npm install`) if needed
5. Create `backend\.env` and `frontend\.env.local` with correct defaults
6. Start the backend in a new window on `http://127.0.0.1:8000`
7. Start the frontend dev server in a new window on `http://localhost:5173`

**Open your browser at: http://localhost:5173**

> **First run only**: Python dependencies take 5–15 minutes to install (PyTorch is ~800 MB).  
> Subsequent starts take ~5 seconds.

---

## 3. Manual Setup

Use this if you prefer step-by-step control or if `start.bat` fails.

### 3.1 — Clone the repository

Open **Command Prompt** or **PowerShell**:

```cmd
git clone https://github.com/your-org/WhyteBox.git
cd WhyteBox\whytebox-v2
```

### 3.2 — Backend Setup

#### Create a Python virtual environment

```cmd
cd backend
python -m venv venv
venv\Scripts\activate
```

> Your prompt should now show `(venv)` at the start.  
> If `python` is not found, try `py -m venv venv` instead.

#### Install Python dependencies

**Recommended — install from requirements.txt:**

```cmd
pip install -r requirements.txt
```

**Minimal install** (if requirements.txt fails — PyTorch CPU only):

```cmd
pip install fastapi uvicorn[standard] python-multipart ^
    pydantic pydantic-settings ^
    aiosqlite sqlalchemy ^
    pillow numpy ^
    python-dotenv aiofiles ^
    prometheus-client python-json-logger psutil

pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

> Full install requires ~1.5 GB disk space. PyTorch alone is ~800 MB.

#### Create backend environment file

```cmd
copy .env.example .env
```

If `.env.example` does not exist, create `backend\.env` manually:

```
HOST=0.0.0.0
PORT=8000
DATABASE_URL=sqlite+aiosqlite:///./whytebox_local.db
REDIS_URL=
DEBUG=true
ENVIRONMENT=development
SECRET_KEY=dev-secret-key-change-in-production-32chars
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173,http://localhost:3000
PYTORCH_DEVICE=cpu
LOG_LEVEL=INFO
```

> **SQLite** is used by default — no database server needed for development.  
> **Redis** is optional — leave `REDIS_URL=` empty to run without caching.

#### Start the backend

```cmd
cd backend
venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> ⚠️ **Important**: Use `127.0.0.1` not `0.0.0.0` or `localhost`.  
> On Windows with Node.js 18+, `localhost` resolves to IPv6 `::1`, but uvicorn  
> binds to IPv4 `127.0.0.1`. Using `127.0.0.1` explicitly avoids connection errors.

The API will be available at http://127.0.0.1:8000

### 3.3 — Frontend Setup

Open a **new** Command Prompt or PowerShell window:

```cmd
cd WhyteBox\whytebox-v2\frontend
npm install
```

#### Create frontend environment file

Create `frontend\.env.local` with this content:

```
VITE_BACKEND_PORT=8000
VITE_WS_URL=ws://127.0.0.1:8000
```

> ⚠️ **Do NOT set `VITE_API_URL` in `.env.local`.**  
> The Vite dev server proxies `/api/*` requests to the backend using `VITE_BACKEND_PORT`.  
> Setting `VITE_API_URL` bypasses the proxy and causes IPv6 connection errors on Windows.

#### Start the frontend

```cmd
npm run dev
```

The frontend will be available at http://localhost:5173

---

## 4. Environment Configuration

### Backend environment variables (`backend\.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Host to bind uvicorn to |
| `PORT` | `8000` | Port for the backend API |
| `DATABASE_URL` | `sqlite+aiosqlite:///./whytebox_local.db` | Database connection string |
| `REDIS_URL` | *(empty)* | Redis connection — leave empty to disable caching |
| `DEBUG` | `true` | Enable debug mode and auto-reload |
| `ENVIRONMENT` | `development` | `development` or `production` |
| `SECRET_KEY` | *(required)* | JWT signing key — change in production |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | Allowed frontend origins for CORS |
| `PYTORCH_DEVICE` | `cpu` | `cpu` or `cuda` for GPU |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

### Frontend environment variables (`frontend\.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_PORT` | `8000` | Port where the backend is running — used by Vite proxy |
| `VITE_WS_URL` | `ws://127.0.0.1:8000` | WebSocket URL for live inference streaming |

> **Note**: `VITE_API_URL` and `VITE_API_BASE_URL` should **not** be set in `.env.local` for local development. The Vite proxy handles routing automatically. These variables are only used for production builds.

---

## 5. Running the Application

### Option A — One-command batch script (recommended)

```cmd
cd WhyteBox\whytebox-v2
start.bat
```

Opens two windows: one for the backend, one for the frontend.  
Open **http://localhost:5173** in your browser.

### Option B — Two terminals (manual)

**Terminal 1 — Backend:**
```cmd
cd WhyteBox\whytebox-v2\backend
venv\Scripts\activate
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```cmd
cd WhyteBox\whytebox-v2\frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

### Stopping the application

- Close the backend and frontend terminal windows, or
- Press `Ctrl+C` in each terminal window

---

## 6. Verifying the Installation

### Check backend health

Open http://127.0.0.1:8000/health in your browser. You should see:

```json
{
  "status": "healthy",
  "version": "2.0.0",
  "environment": "development"
}
```

### Check API documentation

Open http://127.0.0.1:8000/docs — the Swagger UI should load with all endpoints listed.

### Check frontend

Open http://localhost:5173 — the WhyteBox dashboard should load and show available models.

### Test model listing

1. Open the browser console (F12 → Console tab)
2. You should see `[API Response] GET /api/v1/models` with model data
3. No red errors should appear

### Test 3D visualization

1. Go to the **Visualization** page
2. Select **ResNet-50** from the model dropdown
3. The 3D architecture should render in the browser
4. First load downloads model weights (~100 MB) — takes 1–2 minutes

---

## 7. Troubleshooting

### `python` not found

```
'python' is not recognized as an internal or external command
```

**Fix**: Reinstall Python and check "Add Python to PATH". Then restart your terminal.  
Alternatively use `py` instead of `python`:
```cmd
py -m venv venv
```

### `npm` not found

```
'npm' is not recognized as an internal or external command
```

**Fix**: Reinstall Node.js from https://nodejs.org/ and restart your terminal.

### `ECONNREFUSED ::1:8000` — proxy connection refused

```
Error: connect ECONNREFUSED ::1:8000
```

This is the most common Windows issue. Node.js 18+ resolves `localhost` to IPv6 `::1`, but uvicorn listens on IPv4 `127.0.0.1`.

**Fix 1**: Start uvicorn with `127.0.0.1` explicitly (already done in `start.bat`):
```cmd
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

**Fix 2**: Ensure `frontend\.env.local` does NOT contain `VITE_API_URL`. It should only have:
```
VITE_BACKEND_PORT=8000
VITE_WS_URL=ws://127.0.0.1:8000
```

**Fix 3**: Delete the Vite cache and restart:
```cmd
rmdir /s /q frontend\node_modules\.vite
cd frontend && npm run dev
```

### Port 8000 already in use

```
ERROR: [Errno 10048] error while attempting to bind on address ('127.0.0.1', 8000)
```

**Fix**: Find and kill the process using port 8000:
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

Or change the backend port in `backend\.env`:
```
PORT=8001
```
And update `frontend\.env.local`:
```
VITE_BACKEND_PORT=8001
```

### Port 5173 already in use

Vite automatically tries the next available port (5174, 5175, etc.) and prints the actual URL in the terminal.

### `torch` installation fails or times out

PyTorch has large wheels (~800 MB). If pip times out:
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu --timeout 300
```

If you get SSL errors:
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu --trusted-host download.pytorch.org
```

### 500 Internal Server Error on `/api/v1/models`

Check the backend terminal window for the Python traceback. Common causes:

1. **Missing dependency**: Run `pip install -r requirements.txt` in the backend venv
2. **Database error**: Delete `backend\whytebox_local.db` and restart the backend
3. **Import error**: Check that the venv is activated before starting uvicorn

### CORS errors in browser console

```
Access to fetch at 'http://...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Fix**: Add `http://localhost:5173` to `ALLOWED_ORIGINS` in `backend\.env`:
```
ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173,http://localhost:3000
```
Then restart the backend.

### Redis connection warnings

```
Redis cache connection failed: Error 61 connecting to localhost:6379
```

This is **non-fatal** — the app runs fine without Redis. To suppress the warning, set `REDIS_URL=` (empty) in `backend\.env`.

### Windows Defender / Antivirus blocking

Windows Defender may flag PyTorch or model weight files. Add the project directory to exclusions:
1. Open **Windows Security** → **Virus & threat protection**
2. **Manage settings** → **Exclusions** → **Add an exclusion** → **Folder**
3. Select the `WhyteBox` directory

### Database errors on startup

If you see SQLite errors, delete the database file and restart:
```cmd
del backend\whytebox_local.db
```

### `venv\Scripts\activate` fails in PowerShell

PowerShell may block script execution. Run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try activating again.

---

## 8. GPU Acceleration (Optional)

If you have an NVIDIA GPU, install the CUDA version of PyTorch for faster inference.

### Check your CUDA version

```cmd
nvidia-smi
```

Look for "CUDA Version" in the output.

### Install PyTorch with CUDA

**CUDA 11.8:**
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
```

**CUDA 12.1:**
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

**CUDA 12.4:**
```cmd
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
```

### Enable GPU in backend

Set in `backend\.env`:
```
PYTORCH_DEVICE=cuda
```

### Verify GPU is detected

```cmd
python -c "import torch; print('CUDA available:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
```

---

## 9. Docker (Alternative)

Docker handles all dependencies automatically but requires more disk space (~5 GB).

### Prerequisites

- Docker Desktop: https://www.docker.com/products/docker-desktop/
- WSL 2 (required by Docker Desktop on Windows): run `wsl --install` in PowerShell (Admin), then restart

### Start with Docker

```cmd
cd WhyteBox\whytebox-v2
docker compose up --build
```

> First build takes 10–20 minutes. Subsequent starts take ~30 seconds.

### Access the app

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |

### Stop

```cmd
docker compose down
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `start.bat` | Start both backend and frontend (recommended) |
| `venv\Scripts\activate` | Activate Python virtual environment |
| `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload` | Start backend |
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `docker compose up --build` | Start all services with Docker |
| `docker compose down` | Stop all Docker services |

---

## Directory Structure

```
whytebox-v2\
├── backend\              ← FastAPI Python backend
│   ├── app\
│   │   ├── api\          ← REST API endpoints
│   │   ├── core\         ← Config, database, cache
│   │   └── services\     ← Model loading, inference
│   ├── requirements.txt  ← Python dependencies
│   └── .env              ← Backend environment (auto-created by start.bat)
├── frontend\             ← React + TypeScript frontend
│   ├── src\
│   │   ├── babylon\      ← 3D visualization (BabylonJS)
│   │   ├── components\   ← React components
│   │   ├── pages\        ← Page components
│   │   └── services\     ← API client
│   ├── package.json      ← Node.js dependencies
│   └── .env.local        ← Frontend environment (auto-created by start.bat)
├── start.bat             ← One-command Windows startup script
├── docker-compose.yml    ← Docker services definition
└── WINDOWS_SETUP.md      ← This file
```

---

*Made with Bob — WhyteBox v2.0*