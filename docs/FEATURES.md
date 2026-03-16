# WhyteBox v2 — Feature Documentation

This document provides detailed information about all features in WhyteBox v2.

## 📊 Table of Contents

- [3D Visualization Features](#3d-visualization-features)
- [Inference Features](#inference-features)
- [Explainability Features](#explainability-features)
- [Educational Features](#educational-features)
- [Recent Updates (March 2026)](#recent-updates-march-2026)

---

## 3D Visualization Features

### Interactive 3D Architecture Viewer

**Location**: Visualization Page

**Description**: View neural network architectures in interactive 3D using BabylonJS.

**Features**:

- Layer-type color coding (conv=blue, dense=teal, activation=yellow, etc.)
- Custom mesh shapes per layer type
- Click and drag to rotate
- Scroll to zoom
- Adaptive layout for small/medium/large models
- LOD (Level of Detail) for models with 60+ layers

**Supported Models**:

- CNNs: ResNet, VGG, MobileNet, EfficientNet, AlexNet
- Transformers: BERT, GPT-2, ViT

---

### Layer Explanation Sidebar ✨ NEW

**Location**: Visualization Page → Click any layer

**Description**: Educational sidebar that explains what each layer does in plain English.

**What You'll See**:

- **Layer Type**: Conv2d, Linear, BatchNorm, etc.
- **Plain English Explanation**: What the layer does and why it's important
- **Parameters**: Detailed configuration (channels, kernel size, etc.)
- **Architecture Context**: How it fits in the overall model

**Example**:

```
Click a Conv2d layer →
"This convolutional layer scans the image with 64 filters to detect
features like edges, textures, and patterns. It uses 3×3 kernels with
padding to maintain spatial dimensions."
```

**Coverage**: All major layer types including:

- Convolutional layers (Conv1d, Conv2d, Conv3d)
- Linear/Dense layers
- Pooling layers (MaxPool, AvgPool, AdaptiveAvgPool)
- Normalization (BatchNorm, LayerNorm, GroupNorm)
- Activation functions (ReLU, GELU, Sigmoid, Tanh)
- Regularization (Dropout)
- Transformer components (MultiheadAttention, Embedding)

---

### Data Flow Animation ✨ NEW

**Location**: Visualization Page (during streaming inference)

**Description**: Watch signal travel layer-by-layer through the 3D architecture in real-time.

**How It Works**:

1. Go to Inference page
2. Upload an image
3. Click "Run Streaming Inference"
4. Switch to Visualization page
5. Watch the animation

**Visual Effects**:

- **Active Layer**: Glows bright blue, scales up 1.1x
- **Completed Layers**: Fade to 60% opacity
- **Pending Layers**: Normal appearance
- **Auto-Reset**: Cleans up when inference completes

**Technical Details**:

- Uses WebSocket streaming for real-time updates
- Stores original mesh properties for clean reset
- No conflicts with other visualization features

---

### Grad-CAM Layer Contributions ✨ NEW

**Location**: Visualization Page (after running Grad-CAM)

**Description**: See which layers contributed most to the model's decision, visualized as mesh colors.

**How It Works**:

1. Go to Explainability page
2. Upload an image
3. Run Grad-CAM (single or compare mode)
4. Switch to Visualization page
5. Layers are colored by contribution

**Color Mapping**:

- **Red** (0.67-1.0): High contribution — this layer was critical
- **Orange** (0.34-0.66): Medium contribution — moderate importance
- **Blue** (0.0-0.33): Low contribution — minimal impact

**Technical Details**:

- Backend computes gradient magnitudes during backward pass
- Scores normalized to 0.0-1.0 range
- Cross-page state management via Zustand store
- Persists until you run a different explainability method

---

## Inference Features

### Standard Inference

**Location**: Inference Page

**Description**: Upload an image and get top-5 predictions with confidence scores.

**Supported Formats**: JPG, PNG, JPEG

**Output**:

- Top-5 class predictions
- Confidence scores (0-100%)
- Inference time in milliseconds
- Image preprocessing details

---

### Streaming Inference

**Location**: Inference Page → "Run Streaming Inference"

**Description**: Real-time inference with layer-by-layer progress updates via WebSocket.

**Features**:

- Live progress bar
- Layer-by-layer status updates
- Real-time visualization animation (see Data Flow Animation above)
- Cancellable mid-inference

**Use Cases**:

- Educational demonstrations
- Understanding model execution flow
- Debugging slow layers

---

## Explainability Features

### Grad-CAM (Gradient-weighted Class Activation Mapping)

**Location**: Explainability Page

**Description**: Highlights which regions of the image the model focused on for its decision.

**How It Works**:

- Computes gradients flowing into the final convolutional layer
- Weights activation maps by gradient importance
- Generates heatmap overlay on original image

**Parameters**:

- **Target Layer**: Which conv layer to visualize (auto-selected by default)
- **Target Class**: Which class to explain (defaults to predicted class)

**Output**:

- Heatmap (red=important, blue=unimportant)
- Overlay image (heatmap + original)
- Layer contribution scores (NEW)

---

### Saliency Maps

**Location**: Explainability Page

**Description**: Shows pixel-level importance by computing gradient magnitude.

**How It Works**:

- Computes gradient of output w.r.t. input pixels
- Takes absolute value of gradients
- Normalizes to 0-255 range

**Parameters**:

- **SmoothGrad**: Reduces noise by averaging over multiple noisy samples
- **N Samples**: Number of noisy samples (if SmoothGrad enabled)
- **Noise Level**: Standard deviation of Gaussian noise

**Output**:

- Grayscale saliency map
- Overlay on original image

---

### Integrated Gradients

**Location**: Explainability Page

**Description**: Path-integrated attribution method (Sundararajan et al. 2017). More robust than vanilla gradients.

**How It Works**:

- Integrates gradients along path from baseline to input
- Baseline can be zeros, blur, or noise
- Accumulates attribution over multiple steps

**Parameters**:

- **Num Steps**: Integration steps (more = smoother, slower)
- **Baseline Type**: zeros, blur, or noise

**Output**:

- Attribution heatmap
- Overlay on original image

---

### Compare Mode

**Location**: Explainability Page → "Compare All Methods"

**Description**: Run all three explainability methods side-by-side for comparison.

**Output**:

- Three heatmaps in a grid
- Compute time for each method
- Predicted class and confidence

---

## Educational Features

### Tutorials

**Location**: Tutorials Page

**Description**: Step-by-step interactive tutorials on neural networks and explainability.

**Topics**:

- Getting Started with WhyteBox
- Understanding Model Architecture
- Grad-CAM Deep Dive
- Integrated Gradients Explained
- Comparing Explainability Methods
- Transformers and Attention

---

### Quizzes

**Location**: Quizzes Page

**Description**: Test your knowledge with interactive quizzes.

**Topics**:

- Neural Networks Intro
- Model Architecture
- Grad-CAM Basics
- Integrated Gradients
- Transformers and Attention

**Features**:

- Multiple choice questions
- Instant feedback
- Progress tracking
- Explanations for correct/incorrect answers

---

### Learning Paths

**Location**: Learning Paths Page

**Description**: Structured learning journeys through related content.

**Available Paths**:

- AI Explainability Fundamentals
- (More coming soon)

---

### Documentation

**Location**: Documentation Page

**Description**: Comprehensive guides and reference material.

**Sections**:

- Getting Started Guide
- API Reference
- Architecture Overview
- Deployment Guide

---

## Recent Updates (March 2026)

### Three New Educational UX Features

1. **Layer Explanation Sidebar**
   - Click any layer to see plain English explanations
   - Covers all major layer types
   - Educational context for beginners

2. **Data Flow Animation**
   - Watch signal travel through architecture during inference
   - Real-time WebSocket streaming
   - Visual feedback with glow and fade effects

3. **Grad-CAM Layer Contributions**
   - Layers colored by contribution after Grad-CAM
   - Red/orange/blue color mapping
   - Cross-page state management

---

## Coming Soon

- [ ] Custom model upload
- [ ] Attention visualization for transformers
- [ ] Feature map expansion in 3D
- [ ] Model comparison mode
- [ ] Export visualizations as images/videos

---

_Made with Bob — WhyteBox v2.0 · Last updated: 2026-03-16_
