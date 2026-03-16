# Getting Started with WhyteBox v2

Welcome to WhyteBox! This guide will help you get up and running in minutes.

## 🚀 Quick Start (Recommended)

### Prerequisites

- **Python 3.10+** (3.11 or 3.12 recommended)
- **Node.js 18 LTS** or 20 LTS
- **Git** (latest version)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/whytebox-v2.git
cd whytebox-v2

# Run the setup script (first time only)
./complete-setup.sh

# Start the application
./start.sh --dev
```

Open your browser to **http://localhost:5173**

That's it! 🎉

---

## 📖 What You'll See

Once the application is running, you'll have access to:

### 1. **Visualization Page** (Main Feature)

- Select a model (ResNet50, VGG16, BERT, etc.)
- See the 3D architecture with interactive layers
- **Click any layer** → Sidebar opens with plain English explanation
- Upload an image → Extract feature maps

### 2. **Inference Page**

- Upload an image
- Select a model
- Run inference to get predictions
- **Try streaming inference** → Watch data flow animation in 3D

### 3. **Explainability Page**

- Upload an image
- Run Grad-CAM, Saliency Maps, or Integrated Gradients
- **After Grad-CAM** → Switch to Visualization to see layer contributions (colored meshes)

### 4. **Educational Content**

- Tutorials on neural networks
- Interactive quizzes
- Learning paths
- Documentation

---

## 🎯 Try These Features

### Feature 1: Layer Explanations

1. Go to **Visualization** page
2. Select "ResNet50" from the dropdown
3. **Click any blue box** (convolutional layer)
4. ✅ Sidebar appears with explanation

### Feature 2: Data Flow Animation

1. Go to **Inference** page
2. Upload any image (cat, dog, etc.)
3. Select a model
4. Click **"Run Streaming Inference"**
5. Switch to **Visualization** page
6. ✅ Watch the signal travel through layers

### Feature 3: Grad-CAM Contributions

1. Go to **Explainability** page
2. Upload an image
3. Select a model
4. Click **"Run Grad-CAM"**
5. Switch to **Visualization** page
6. ✅ Layers are colored: red (high), orange (medium), blue (low)

---

## 🛠️ Development Modes

### Production Mode (Single Port)

```bash
./start.sh
```

- FastAPI serves both API and built frontend
- Access at: **http://localhost:5001**
- Best for: Testing production build

### Development Mode (Hot Reload)

```bash
./start.sh --dev
```

- Frontend: **http://localhost:5173** (Vite dev server)
- Backend: **http://localhost:5001** (FastAPI)
- Best for: Active development

### Rebuild Frontend

```bash
./start.sh --build
```

- Rebuilds frontend, then starts in production mode
- Best for: Testing after frontend changes

---

## 📁 Project Structure

```
whytebox-v2/
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/       # REST endpoints
│   │   ├── services/  # Model registry, inference
│   │   └── explainability/  # Grad-CAM, Saliency, IG
│   └── requirements.txt
│
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── babylon/   # 3D visualization (BabylonJS)
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/     # Zustand state management
│   └── package.json
│
├── start.sh           # One-command startup
└── complete-setup.sh  # First-time setup
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Or use a different port
cd backend
uvicorn app.main:app --reload --port 5002
```

### Backend Not Starting

```bash
# Activate virtual environment
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Frontend Not Starting

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules .vite
npm install
npm run dev
```

### Connection Refused Errors

- Make sure backend is running on port 5001
- Check `frontend/.env.local` has `VITE_BACKEND_PORT=5001`
- Use `127.0.0.1` not `localhost` in backend startup

---

## 📚 Next Steps

1. **Explore the API** → http://localhost:5001/docs
2. **Read the full README** → [README.md](README.md)
3. **Check the architecture docs** → [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. **Try the tutorials** → Built into the app!

---

## 🆘 Need Help?

- **API Documentation**: http://localhost:5001/docs
- **GitHub Issues**: Report bugs or request features
- **README**: Detailed technical documentation
- **DEPLOYMENT_GUIDE**: Production deployment instructions

---

_Made with Bob — WhyteBox v2.0 · Last updated: 2026-03-16_
