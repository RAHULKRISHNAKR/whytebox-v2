@echo off
setlocal enabledelayedexpansion

echo.
echo  ██╗    ██╗██╗  ██╗██╗   ██╗████████╗███████╗██████╗  ██████╗ ██╗  ██╗
echo  ██║    ██║██║  ██║╚██╗ ██╔╝╚══██╔══╝██╔════╝██╔══██╗██╔═══██╗╚██╗██╔╝
echo  ██║ █╗ ██║███████║ ╚████╔╝    ██║   █████╗  ██████╔╝██║   ██║ ╚███╔╝
echo  ██║███╗██║██╔══██║  ╚██╔╝     ██║   ██╔══╝  ██╔══██╗██║   ██║ ██╔██╗
echo  ╚███╔███╔╝██║  ██║   ██║      ██║   ███████╗██████╔╝╚██████╔╝██╔╝ ██╗
echo   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝
echo.
echo  AI Model Explainability Platform v2.0
echo  ========================================
echo.

:: ── Check Python ──────────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Python not found. Install from https://www.python.org/downloads/
        echo         Make sure to check "Add Python to PATH" during installation.
        pause
        exit /b 1
    )
    set PYTHON=py
) else (
    set PYTHON=python
)

:: ── Check Node.js ─────────────────────────────────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org/
    pause
    exit /b 1
)

:: ── Check virtual environment ─────────────────────────────────────────────────
if not exist "backend\venv\Scripts\activate.bat" (
    echo [SETUP] Creating Python virtual environment...
    cd backend
    %PYTHON% -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    cd ..
    echo [SETUP] Installing Python dependencies (this may take several minutes)...
    cd backend
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [WARN]  Full requirements.txt failed. Trying minimal install...
        pip install fastapi uvicorn[standard] python-multipart ^
            pydantic pydantic-settings ^
            aiosqlite sqlalchemy ^
            pillow numpy ^
            python-dotenv aiofiles ^
            prometheus-client python-json-logger psutil
        pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
    )
    cd ..
    echo [SETUP] Python dependencies installed.
)

:: ── Check Node modules ────────────────────────────────────────────────────────
if not exist "frontend\node_modules" (
    echo [SETUP] Installing Node.js dependencies...
    cd frontend
    npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed.
        pause
        exit /b 1
    )
    cd ..
    echo [SETUP] Node.js dependencies installed.
)

:: ── Create backend .env if missing ────────────────────────────────────────────
if not exist "backend\.env" (
    echo [SETUP] Creating backend\.env ...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo [SETUP] backend\.env created from .env.example
    ) else (
        (
            echo HOST=0.0.0.0
            echo PORT=8000
            echo DATABASE_URL=sqlite+aiosqlite:///./whytebox_local.db
            echo REDIS_URL=
            echo DEBUG=true
            echo ENVIRONMENT=development
            echo SECRET_KEY=dev-secret-key-change-in-production-32chars
            echo ALLOWED_ORIGINS=http://localhost:8000,http://localhost:5173,http://localhost:3000
            echo PYTORCH_DEVICE=cpu
            echo LOG_LEVEL=INFO
        ) > backend\.env
        echo [SETUP] backend\.env created with defaults.
    )
)

:: ── Create frontend .env.local if missing ─────────────────────────────────────
:: NOTE: Do NOT set VITE_API_URL here.
:: The Vite dev server proxies /api/* to the backend via VITE_BACKEND_PORT.
:: Setting VITE_API_URL would bypass the proxy and cause IPv6 connection errors
:: (Node.js resolves 'localhost' to ::1 but uvicorn listens on 127.0.0.1).
if not exist "frontend\.env.local" (
    echo [SETUP] Creating frontend\.env.local ...
    (
        echo VITE_BACKEND_PORT=8000
        echo VITE_WS_URL=ws://127.0.0.1:8000
    ) > frontend\.env.local
    echo [SETUP] frontend\.env.local created.
)

:: ── Start Backend ─────────────────────────────────────────────────────────────
echo [START] Launching backend on http://127.0.0.1:8000 ...
start "WhyteBox Backend" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

:: Wait for backend to initialise
echo [WAIT]  Waiting for backend to start...
timeout /t 4 /nobreak > nul

:: ── Start Frontend ────────────────────────────────────────────────────────────
echo [START] Launching frontend on http://localhost:5173 ...
start "WhyteBox Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

:: ── Done ──────────────────────────────────────────────────────────────────────
echo.
echo  WhyteBox is starting up!
echo.
echo     App (frontend)  -^>  http://localhost:5173
echo     API             -^>  http://127.0.0.1:8000
echo     API Docs        -^>  http://127.0.0.1:8000/docs
echo.
echo  Both services are running in separate windows.
echo  Close those windows (or press Ctrl+C in each) to stop.
echo.
echo  NOTE: Backend binds to 127.0.0.1 (not localhost) to avoid IPv6 issues
echo        on Windows with Node.js 18+.
echo.
echo  First run: model weights (~100 MB) will download on first use.
echo.
pause

@REM Made with Bob
