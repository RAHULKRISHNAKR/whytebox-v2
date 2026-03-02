#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# WhyteBox v2 — One-command local startup
#
# Usage:
#   ./start.sh          # single-port mode (FastAPI serves built frontend)
#   ./start.sh --dev    # dual-port mode (Vite dev server + FastAPI, hot-reload)
#   ./start.sh --build  # rebuild frontend then start single-port mode
#
# Single-port mode (default):
#   FastAPI on :5001 serves both /api/v1/* and the built frontend dist/
#   Open: http://localhost:5001
#
# Dev mode (--dev):
#   FastAPI on :5001  →  API only
#   Vite on   :5173  →  Frontend with hot-reload
#   Open: http://localhost:5173
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()    { echo -e "${CYAN}==>${NC} $*"; }
success() { echo -e "${GREEN}✓${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠${NC} $*"; }
error()   { echo -e "${RED}✗${NC} $*" >&2; }

# ── Resolve script directory (works even when called from another dir) ────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# ── Parse flags ──────────────────────────────────────────────────────────────
DEV_MODE=false
BUILD_FIRST=false
for arg in "$@"; do
  case "$arg" in
    --dev)   DEV_MODE=true ;;
    --build) BUILD_FIRST=true ;;
    --help|-h)
      echo "Usage: $0 [--dev] [--build]"
      echo "  (no flags)  Single-port mode — FastAPI on :5001 serves built frontend"
      echo "  --dev       Dual-port mode — Vite :5173 + FastAPI :5001 (hot-reload)"
      echo "  --build     Rebuild frontend before starting"
      exit 0
      ;;
  esac
done

# ── Prerequisite checks ───────────────────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v python3 &>/dev/null; then
  error "python3 not found. Install Python 3.11+."
  exit 1
fi

if ! command -v uvicorn &>/dev/null && [ ! -f "$BACKEND_DIR/venv/bin/uvicorn" ]; then
  warn "uvicorn not found globally. Checking for venv..."
fi

if $DEV_MODE || $BUILD_FIRST; then
  if ! command -v node &>/dev/null; then
    error "node not found. Install Node.js 18+ for frontend dev/build."
    exit 1
  fi
  if ! command -v npm &>/dev/null; then
    error "npm not found."
    exit 1
  fi
fi

# ── Activate Python venv if present ──────────────────────────────────────────
VENV="$BACKEND_DIR/venv"
if [ -f "$VENV/bin/activate" ]; then
  # shellcheck disable=SC1091
  source "$VENV/bin/activate"
  success "Python venv activated"
else
  warn "No venv found at $VENV — using system Python"
  warn "Run: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
fi

# ── Optionally rebuild frontend ───────────────────────────────────────────────
if $BUILD_FIRST; then
  info "Building frontend..."
  cd "$FRONTEND_DIR"
  npm install --silent
  npm run build
  success "Frontend built → $FRONTEND_DIR/dist/"
  cd "$SCRIPT_DIR"
fi

# ── Check that dist/ exists for single-port mode ─────────────────────────────
if ! $DEV_MODE && [ ! -d "$FRONTEND_DIR/dist" ]; then
  warn "frontend/dist/ not found. Building now..."
  if ! command -v node &>/dev/null; then
    error "node not found — cannot build frontend. Run with --dev or install Node.js."
    exit 1
  fi
  cd "$FRONTEND_DIR"
  npm install --silent
  npm run build
  success "Frontend built"
  cd "$SCRIPT_DIR"
fi

# ── Cleanup on exit ───────────────────────────────────────────────────────────
cleanup() {
  echo ""
  info "Shutting down..."
  # Kill background jobs spawned by this script
  jobs -p | xargs -r kill 2>/dev/null || true
  wait 2>/dev/null || true
  success "Stopped."
}
trap cleanup EXIT INT TERM

# ── Start ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  WhyteBox v2 — Local Development${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if $DEV_MODE; then
  echo -e "  Mode    : ${YELLOW}dual-port (hot-reload)${NC}"
  echo -e "  API     : ${GREEN}http://localhost:5001/api/v1${NC}"
  echo -e "  API docs: ${GREEN}http://localhost:5001/docs${NC}"
  echo -e "  App     : ${GREEN}http://localhost:5173${NC}  ← open this"
  echo ""

  # Start FastAPI in background
  info "Starting FastAPI backend on :5001..."
  cd "$BACKEND_DIR"
  uvicorn app.main:app --reload --host 0.0.0.0 --port 5001 &
  BACKEND_PID=$!
  cd "$SCRIPT_DIR"

  # Give backend a moment to start
  sleep 1

  # Start Vite dev server in foreground (so Ctrl-C stops everything via trap)
  info "Starting Vite dev server on :5173..."
  cd "$FRONTEND_DIR"
  npm run dev
else
  echo -e "  Mode    : ${YELLOW}single-port (production build)${NC}"
  echo -e "  App     : ${GREEN}http://localhost:5001${NC}  ← open this"
  echo -e "  API docs: ${GREEN}http://localhost:5001/docs${NC}"
  echo ""

  info "Starting FastAPI on :5001 (serving built frontend + API)..."
  cd "$BACKEND_DIR"
  uvicorn app.main:app --host 0.0.0.0 --port 5001
fi

# Made with Bob
