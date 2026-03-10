# WhyteBox v2 - Production Deployment Guide

This guide covers deploying WhyteBox v2 to production environments.

## 🚀 Quick Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Static files built and served
- [ ] HTTPS/SSL certificates configured
- [ ] CORS origins restricted to production domains
- [ ] Secret keys rotated from defaults
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented
- [ ] Rate limiting enabled
- [ ] Security headers configured

---

## 🏗️ Architecture Overview

### Production Stack

**Frontend (Static)**
- Built React SPA served via CDN or static hosting
- Vite production build with code splitting
- Gzip/Brotli compression enabled

**Backend (API)**
- FastAPI with Gunicorn/Uvicorn workers
- PostgreSQL database (production)
- Redis cache (recommended)
- WebSocket support for streaming

**Infrastructure**
- Reverse proxy (Nginx/Caddy)
- SSL/TLS termination
- Load balancing (optional)
- CDN for static assets

---

## 📦 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Production deployment with Docker
cd whytebox-v2
docker-compose -f docker-compose.prod.yml up -d
```

**docker-compose.prod.yml** includes:
- Backend API with Gunicorn
- PostgreSQL database
- Redis cache
- Nginx reverse proxy

### Option 2: Platform as a Service (PaaS)

**Backend**: Deploy to Render, Railway, or Fly.io
**Frontend**: Deploy to Vercel, Netlify, or Cloudflare Pages
**Database**: Managed PostgreSQL (Render, Supabase, Neon)
**Cache**: Managed Redis (Upstash, Redis Cloud)

### Option 3: Traditional VPS

Deploy to DigitalOcean, Linode, or AWS EC2 with:
- Systemd service for backend
- Nginx for reverse proxy and static files
- PostgreSQL and Redis installed locally

---

## ⚙️ Environment Configuration

### Backend Production Environment

Create `backend/.env.prod`:

```bash
# Server Configuration
HOST=0.0.0.0
PORT=5001
DEBUG=false
ENVIRONMENT=production

# Database (PostgreSQL required for production)
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/whytebox
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=10

# Redis Cache (highly recommended)
REDIS_URL=redis://redis:6379/0
REDIS_CACHE_TTL=3600

# Security (MUST CHANGE)
SECRET_KEY=<generate-strong-random-key-min-32-chars>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (restrict to your domains)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# File Upload
MAX_UPLOAD_SIZE=524288000
UPLOAD_DIR=/app/storage/uploads
MODEL_CACHE_SIZE=10

# ML Settings
PYTORCH_DEVICE=cpu  # or cuda if GPU available
TENSORFLOW_DEVICE=/CPU:0  # or /GPU:0
MODEL_CACHE_TTL=7200

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090

# Celery (for background tasks)
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2
```

### Frontend Production Environment

Create `frontend/.env.production`:

```bash
# API Configuration (full URL required in production)
VITE_API_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_3D_VISUALIZATION=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false

# BabylonJS Configuration
VITE_BABYLON_ANTIALIAS=true
VITE_BABYLON_ADAPTIVE_DEVICE_RATIO=true

# Application
VITE_APP_NAME=WhyteBox
VITE_APP_VERSION=2.0.0
```

---

## 🔒 Security Hardening

### 1. Generate Strong Secret Key

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. Configure CORS Properly

```python
# backend/app/core/config.py
ALLOWED_ORIGINS = [
    "https://yourdomain.com",
    "https://www.yourdomain.com",
    # NO wildcards in production!
]
```

### 3. Enable Security Headers

Nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 4. Rate Limiting

```python
# backend/app/middleware/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/v1/models")
@limiter.limit("100/minute")
async def list_models():
    ...
```

### 5. Input Validation

All endpoints use Pydantic models for automatic validation:

```python
from pydantic import BaseModel, Field

class InferenceRequest(BaseModel):
    model_id: str = Field(..., min_length=1, max_length=100)
    image: str = Field(..., description="Base64 encoded image")
```

---

## 🗄️ Database Setup

### PostgreSQL Production Setup

```bash
# Create database
createdb whytebox

# Run migrations
cd backend
alembic upgrade head

# Create initial admin user (optional)
python -m app.scripts.create_admin
```

### Database Backup Strategy

```bash
# Daily backup script
#!/bin/bash
BACKUP_DIR="/backups/whytebox"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump whytebox | gzip > "$BACKUP_DIR/whytebox_$DATE.sql.gz"

# Keep only last 30 days
find $BACKUP_DIR -name "whytebox_*.sql.gz" -mtime +30 -delete
```

---

## 🏗️ Build Process

### Backend Build

```bash
cd backend

# Install production dependencies
pip install -r requirements.txt

# Run tests
pytest

# Type checking
mypy app/

# Linting
flake8 app/
```

### Frontend Build

```bash
cd frontend

# Install dependencies
npm ci

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build

# Output: frontend/dist/
```

---

## 🚀 Deployment Steps

### Using Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/yourusername/whytebox-v2.git
cd whytebox-v2

# 2. Configure environment
cp backend/.env.example backend/.env.prod
cp frontend/.env.example frontend/.env.production
# Edit both files with production values

# 3. Build and start services
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# 4. Run database migrations
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

# 5. Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Using Systemd (VPS)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install python3.11 python3.11-venv postgresql redis-server nginx

# 2. Setup application
cd /opt
sudo git clone https://github.com/yourusername/whytebox-v2.git
cd whytebox-v2/backend
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 3. Create systemd service
sudo nano /etc/systemd/system/whytebox.service
```

**whytebox.service**:

```ini
[Unit]
Description=WhyteBox API
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/opt/whytebox-v2/backend
Environment="PATH=/opt/whytebox-v2/backend/venv/bin"
ExecStart=/opt/whytebox-v2/backend/venv/bin/gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:5001 \
    --access-logfile /var/log/whytebox/access.log \
    --error-logfile /var/log/whytebox/error.log
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# 4. Enable and start service
sudo systemctl enable whytebox
sudo systemctl start whytebox
sudo systemctl status whytebox
```

---

## 🌐 Nginx Configuration

```nginx
# /etc/nginx/sites-available/whytebox
upstream whytebox_backend {
    server 127.0.0.1:5001;
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Frontend static files
    location / {
        root /opt/whytebox-v2/frontend/dist;
        try_files $uri $uri/ /index.html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass http://whytebox_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # WebSocket proxy
    location /ws/ {
        proxy_pass http://whytebox_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Health check
    location /health {
        proxy_pass http://whytebox_backend;
        access_log off;
    }
}
```

---

## 📊 Monitoring & Logging

### Application Metrics

WhyteBox exposes Prometheus metrics at `/metrics`:

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'whytebox'
    static_configs:
      - targets: ['localhost:9090']
```

### Logging

Logs are output in JSON format for easy parsing:

```bash
# View logs
docker-compose logs -f backend

# Or with systemd
journalctl -u whytebox -f
```

### Health Checks

```bash
# API health
curl https://yourdomain.com/health

# Database health
curl https://yourdomain.com/api/v1/health/db

# Redis health
curl https://yourdomain.com/api/v1/health/cache
```

---

## 🔄 Updates & Maintenance

### Zero-Downtime Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build new Docker images
docker-compose -f docker-compose.prod.yml build

# 3. Rolling update
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend

# 4. Run migrations if needed
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| 502 Bad Gateway | Check backend service is running: `systemctl status whytebox` |
| CORS errors | Verify `ALLOWED_ORIGINS` includes your domain |
| Database connection failed | Check `DATABASE_URL` and PostgreSQL is running |
| Redis connection failed | Check `REDIS_URL` and Redis is running |
| High memory usage | Reduce `MODEL_CACHE_SIZE` or add more RAM |
| Slow inference | Consider GPU deployment or model optimization |

### Debug Mode

```bash
# Enable debug logging temporarily
docker-compose -f docker-compose.prod.yml exec backend \
  env LOG_LEVEL=DEBUG python -m app.main
```

---

## 📈 Performance Optimization

### Backend Optimization

1. **Enable Redis caching** for model metadata and inference results
2. **Use Gunicorn with multiple workers** (4-8 workers recommended)
3. **Enable model caching** to avoid reloading models
4. **Use GPU** for inference if available

### Frontend Optimization

1. **Enable CDN** for static assets
2. **Lazy load** BabylonJS scenes
3. **Code splitting** already configured in Vite
4. **Image optimization** for uploaded images

### Database Optimization

1. **Connection pooling** configured in SQLAlchemy
2. **Indexes** on frequently queried columns
3. **Regular VACUUM** for PostgreSQL

---

## 📄 License

MIT License - see LICENSE file for details.

---

*WhyteBox v2.0 Production Guide · Last updated: 2026-03-10*