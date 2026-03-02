# WhyteBox v2 — Neural Network Visualization & Explainability Platform

> An interactive platform for visualizing neural network architectures in 3D, running live inference, and explaining model decisions with Grad-CAM, Saliency Maps, and Integrated Gradients.

---

## ✨ Features

### 🧠 Models Supported

| Model | Type | Parameters |
|-------|------|-----------|
| ResNet-50 | CNN — Residual | 25.6M |
| VGG16 | CNN — Deep | 138M |
| MobileNetV2 | CNN — Efficient | 3.5M |
| EfficientNet-B0 | CNN — Compound-scaled | 5.3M |
| AlexNet | CNN — Historic | 61M |
| BERT-base | Transformer — NLP | 110M |
| GPT-2 | Transformer — Generative | 117M |
| ViT-B/16 | Transformer — Vision | 86M |

All pretrained models use static architecture data — **no model weights are downloaded** just to view the architecture. Weights are only downloaded when you run inference.

### 🎯 Core Capabilities

- **3D Architecture Visualization** — Interactive BabylonJS scene with layer-type colour coding and custom mesh shapes (conv = box, dense = sphere, attention head = diamond, feed-forward = hexagonal prism, etc.)
- **Live Inference** — Upload an image and run it through any model; see top-5 predictions with confidence scores
- **Explainability Methods**:
  - **Grad-CAM** — Gradient-weighted Class Activation Mapping
  - **Saliency Maps** — Raw gradient magnitude per pixel
  - **Integrated Gradients** — Path-integrated attribution (Sundararajan et al. 2017); more robust than Guided Backprop
- **Attention Heatmaps** — For transformer models (BERT, GPT-2, ViT), visualize multi-head attention patterns per layer
- **Educational Content** — Tutorials, quizzes, learning paths, and documentation built in
- **WebSocket Streaming** — Real-time inference progress updates

---

## 🚀 Quick Start

### macOS / Linux

```bash
cd whytebox-v2
./start.sh
```

Open **http://localhost:5173**

Other modes:
```bash
./start.sh --dev     # hot-reload frontend (Vite :5173) + backend (:8000)
./start.sh --build   # rebuild frontend dist then start
```

### Windows

Double-click `start.bat` or run from Command Prompt:

```cmd
cd whytebox-v2
start.bat
```

Open **http://localhost:5173**

> See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows instructions and troubleshooting.

---

## 🛠️ Manual Setup

### Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10, 3.11, or 3.12 |
| Node.js | 18 LTS or 20 LTS |
| Git | Latest |

### Backend

```bash
cd whytebox-v2/backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env              # Windows: copy .env.example .env

# Start backend
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

> ⚠️ Use `127.0.0.1` not `localhost` — on macOS/Windows with Node.js 18+, `localhost` resolves to IPv6 `::1` but uvicorn binds to IPv4, causing proxy connection errors.

### Frontend

```bash
cd whytebox-v2/frontend

# Install dependencies
npm install

# Create environment file (do NOT set VITE_API_URL — proxy handles routing)
echo "VITE_BACKEND_PORT=8000" > .env.local

# Start dev server
npm run dev
```

Open **http://localhost:5173**

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Bind host |
| `PORT` | `8000` | API port |
| `DATABASE_URL` | `sqlite+aiosqlite:///./whytebox_local.db` | SQLite (no setup needed) |
| `REDIS_URL` | *(empty)* | Optional — leave empty to disable caching |
| `DEBUG` | `true` | Auto-reload on code changes |
| `SECRET_KEY` | *(required)* | JWT signing key |
| `ALLOWED_ORIGINS` | `http://localhost:5173,...` | CORS allowed origins |
| `PYTORCH_DEVICE` | `cpu` | `cpu` or `cuda` |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_BACKEND_PORT` | `8000` | Backend port — used by Vite proxy |
| `VITE_WS_URL` | `ws://127.0.0.1:8000` | WebSocket URL for streaming inference |

> **Note**: Do not set `VITE_API_URL` in `.env.local` for local development. The Vite dev server proxies `/api/*` to `127.0.0.1:VITE_BACKEND_PORT` automatically. `VITE_API_URL` is only used in production builds.

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- React 18 + TypeScript 5
- BabylonJS 6 (3D visualization)
- Material-UI 5 (component library)
- Redux Toolkit + Zustand (state management)
- TanStack Query (data fetching)
- Vite 5 (build tool)
- Vitest + Playwright (testing)

**Backend**
- FastAPI 0.115 (Python 3.10+)
- SQLAlchemy 2.0 + SQLite (local) / PostgreSQL (production)
- PyTorch 2.10 + torchvision 0.25
- Transformers 4.47 (HuggingFace)
- Redis (optional caching)
- WebSocket streaming

### How the Proxy Works (Local Dev)

```
Browser → http://localhost:5173
              │
              ├── /api/v1/*  → Vite proxy → http://127.0.0.1:8000/api/v1/*
              ├── /ws/*      → Vite proxy → ws://127.0.0.1:8000/ws/*
              └── /*         → Vite dev server (React SPA)
```

The Vite proxy uses `127.0.0.1` (not `localhost`) to avoid IPv6 `::1` ECONNREFUSED errors on macOS/Windows with Node.js 18+.

### Project Structure

```
whytebox-v2/
├── backend/                    ← FastAPI Python backend
│   ├── app/
│   │   ├── api/v1/endpoints/   ← REST endpoints (models, inference, explainability, …)
│   │   ├── core/               ← Config, database, cache, monitoring
│   │   ├── services/           ← Model registry, architecture extractor
│   │   │   ├── model_service.py        ← Pretrained model registry + LRU cache
│   │   │   └── static_architectures.py ← Pre-computed architecture data (no weight download)
│   │   └── schemas/            ← Pydantic request/response models
│   ├── requirements.txt
│   └── .env                    ← Backend config (auto-created by start scripts)
│
├── frontend/                   ← React + TypeScript frontend
│   ├── src/
│   │   ├── babylon/            ← BabylonJS 3D scene builder
│   │   │   └── AdvancedSceneBuilder.ts ← Layer mesh shapes + colours
│   │   ├── components/         ← Shared UI components
│   │   │   └── AttentionHeatmap.tsx    ← Transformer attention visualization
│   │   ├── pages/              ← Route-level page components
│   │   │   └── VisualizationPage.tsx   ← 3D viewer + legend
│   │   ├── services/api/       ← Axios API clients
│   │   └── store/              ← Redux + Zustand state
│   ├── dist/                   ← Built frontend (served by FastAPI in single-port mode)
│   ├── .env                    ← Shared env defaults
│   ├── .env.local              ← Local overrides (not committed)
│   └── vite.config.ts          ← Vite config + proxy rules
│
├── start.sh                    ← macOS/Linux one-command startup
├── start.bat                   ← Windows one-command startup
├── Makefile                    ← Dev commands (make dev, make start, make test, …)
├── docker-compose.yml          ← Docker development environment
└── WINDOWS_SETUP.md            ← Detailed Windows setup guide
```

---

## 🧪 Testing

```bash
# Backend tests
cd whytebox-v2/backend
source venv/bin/activate
pytest

# Frontend unit tests
cd whytebox-v2/frontend
npm test

# Frontend tests with coverage
npm run test:coverage

# E2E tests (Playwright)
npm run e2e

# All quality checks
npm run quality:check
```

---

## 🔧 Development Commands

```bash
# macOS/Linux — start both servers (hot-reload)
./start.sh --dev

# Windows — start both servers
start.bat

# Makefile shortcuts (from whytebox-v2/)
make dev          # start backend :8000 + frontend :5173 (hot-reload)
make start        # single-port mode (FastAPI :8000 serves built frontend)
make test         # run all tests
make lint         # run all linters
make format       # auto-format all code
make type-check   # TypeScript + mypy type checking
make docker-up    # start with Docker Compose
```

---

## 🌐 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/v1/models` | GET | List all available models |
| `/api/v1/models/{id}` | GET | Get model metadata |
| `/api/v1/models/{id}/architecture` | GET | Get layer architecture (static, instant) |
| `/api/v1/models/{id}/layers` | GET | Get layer names for Grad-CAM target selection |
| `/api/v1/inference` | POST | Run inference on an image |
| `/api/v1/explainability` | POST | Generate Grad-CAM / Saliency / Integrated Gradients |
| `/api/v1/explainability/compare` | POST | Compare all explainability methods side-by-side |
| `/api/v1/ws/inference` | WS | Streaming inference with real-time progress |
| `/docs` | GET | Swagger UI (interactive API docs) |
| `/redoc` | GET | ReDoc API docs |

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED ::1:8000` | Use `--host 127.0.0.1` with uvicorn; don't set `VITE_API_URL` in `.env.local` |
| `500 on /api/v1/models` | Check backend terminal for traceback; ensure venv is activated |
| Port 8000 in use (macOS) | macOS AirPlay Receiver uses 5000; use 8000 or kill with `lsof -ti:8000 \| xargs kill -9` |
| Redis warnings on startup | Non-fatal — set `REDIS_URL=` (empty) in `backend/.env` to suppress |
| Vite proxy still hitting wrong port | Delete `frontend/node_modules/.vite` and restart `npm run dev` |

---

## 📄 License

MIT License — see LICENSE file for details.

---

*Made with Bob — WhyteBox v2.0 · Last updated: 2026-03-02*