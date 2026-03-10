#!/bin/bash

# WhyteBox v2 - Restart Development Servers
# Stops running servers and restarts them with clean cache

set -e

echo "🔄 Restarting WhyteBox Development Servers..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kill existing processes on ports 5001 and 5173/5174
echo -e "${BLUE}Stopping existing servers...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:5174 | xargs kill -9 2>/dev/null || true
sleep 2

# Clean Vite cache
echo -e "${BLUE}Cleaning Vite cache...${NC}"
cd frontend
rm -rf node_modules/.vite .vite 2>/dev/null || true
cd ..

echo -e "${GREEN}✓ Cleanup complete${NC}"
echo ""

# Start backend
echo -e "${BLUE}Starting backend on port 5001...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || . venv/bin/activate
python -m app.main &
BACKEND_PID=$!
cd ..

sleep 3

# Check if backend started
if lsof -i:5001 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend started successfully${NC}"
else
    echo -e "${YELLOW}⚠ Backend may not have started properly${NC}"
fi

echo ""

# Start frontend
echo -e "${BLUE}Starting frontend on port 5173...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

# Check if frontend started
if lsof -i:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend started successfully${NC}"
elif lsof -i:5174 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend started on port 5174${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may not have started properly${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ WhyteBox Development Servers Running${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Frontend:  ${BLUE}http://localhost:5173${NC}"
echo -e "Backend:   ${BLUE}http://localhost:5001${NC}"
echo -e "API Docs:  ${BLUE}http://localhost:5001/docs${NC}"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for user interrupt
wait

# Made with Bob
