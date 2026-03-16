# WhyteBox v2.0 - Live Demo Guide

**Purpose**: Step-by-step instructions for executing flawless live demos during presentations

---

## Pre-Demo Setup Checklist

### 1. System Preparation (1 hour before)

#### Backend Setup

```bash
# Navigate to project directory
cd /path/to/whytebox-v2

# Start backend server
cd backend
python3 -m uvicorn app.main:app --reload --port 5001

# Verify backend is running
curl http://localhost:5001/health
# Expected: {"status":"healthy","version":"2.0.0","environment":"development"}
```

#### Frontend Setup

```bash
# In a new terminal
cd /path/to/whytebox-v2/frontend

# Start frontend server
npm run dev

# Verify frontend is running
# Should see: "Local: http://localhost:5173/"
```

#### Browser Setup

- [ ] Open Chrome/Firefox (recommended for best performance)
- [ ] Navigate to http://localhost:5173
- [ ] Zoom to 125% for better visibility (Cmd/Ctrl + Plus)
- [ ] Open Developer Console (F12) - keep it open to monitor for errors
- [ ] Clear browser cache (Cmd/Ctrl + Shift + Delete)
- [ ] Disable browser extensions that might interfere
- [ ] Set browser to full screen mode (F11)

#### Display Setup

- [ ] Connect to projector/external display
- [ ] Set display to "Mirror" mode (not extended)
- [ ] Test display resolution (1920x1080 recommended)
- [ ] Adjust brightness for room lighting
- [ ] Test audio if showing videos

### 2. Demo Assets Preparation

#### Sample Images

Prepare 3-5 high-quality images in `presentation/demos/sample-images/`:

**Recommended Images:**

1. **golden_retriever.jpg** - Clear, well-lit photo of a golden retriever
2. **cat.jpg** - Domestic cat, front-facing
3. **car.jpg** - Side view of a car
4. **airplane.jpg** - Commercial airplane in flight
5. **coffee_cup.jpg** - Coffee cup on a table

**Image Requirements:**

- Format: JPG or PNG
- Size: 224x224 to 1024x1024 pixels
- Quality: High resolution, good lighting
- Content: Single, clear subject
- Background: Not too cluttered

#### Backup Materials

- [ ] Screenshots of each demo step (in case live demo fails)
- [ ] Screen recording of full demo (2-3 minutes)
- [ ] Backup presentation with embedded screenshots
- [ ] USB drive with all materials

### 3. Application State Preparation

#### Pre-load Models

Before the presentation, navigate through the app to cache models:

```bash
# Open browser to http://localhost:5173

# Visit Model Explorer
# Click on ResNet-50 to load it
# Wait for 3D visualization to render
# This caches the model architecture

# Visit Inference page
# Select ResNet-50 from dropdown
# This ensures model is ready for inference
```

#### Clear Previous Results

- [ ] Clear any previous inference results
- [ ] Reset any filters or settings
- [ ] Close unnecessary browser tabs
- [ ] Clear console logs

### 4. Presentation Environment

#### Room Setup

- [ ] Arrive 30 minutes early
- [ ] Test projector connection
- [ ] Test internet connectivity (if needed)
- [ ] Position laptop for easy access
- [ ] Have water nearby
- [ ] Test microphone/audio
- [ ] Adjust room lighting

#### Backup Plan

- [ ] Have backup laptop ready
- [ ] Have mobile hotspot available
- [ ] Have offline version of slides
- [ ] Have printed notes as backup

---

## Demo 1: 3D Model Visualization (3 minutes)

### Objective

Show how WhyteBox renders neural network architectures in interactive 3D

### Starting Point

- URL: http://localhost:5173/explorer
- Model: ResNet-50 (pre-loaded)

### Step-by-Step Instructions

#### Step 1: Navigate to Model Explorer (10 seconds)

```
Action: Click "Models" in sidebar, then "Model Explorer"
Say: "Let me show you the Model Explorer interface."
```

**What to Show:**

- Clean, professional interface
- List of available models on the left
- 3D viewport in the center

**Troubleshooting:**

- If page doesn't load: Refresh browser (F5)
- If models don't appear: Check backend is running

#### Step 2: Load ResNet-50 (15 seconds)

```
Action: Click "ResNet-50" from model list
Say: "I'm loading ResNet-50, one of the most popular computer vision architectures."
```

**What to Show:**

- Loading indicator
- 3D model appearing
- Smooth rendering

**Timing:**

- Should load in 2-3 seconds
- If taking longer, explain: "We're fetching the architecture from the backend"

**Troubleshooting:**

- If model doesn't load: Check console for errors
- If 3D doesn't render: Try refreshing page
- If too slow: Reduce quality settings

#### Step 3: Rotate and Explore (30 seconds)

```
Action: Click and drag to rotate model
Say: "I can rotate this to see it from any angle. Each block represents a layer."
```

**Mouse Controls:**

- Left click + drag: Rotate
- Right click + drag: Pan
- Scroll wheel: Zoom

**What to Point Out:**

- Different colored layers (blue, green, orange)
- Layer organization (sequential flow)
- Overall architecture structure

**Pro Tips:**

- Rotate slowly and smoothly
- Don't spin too fast (makes audience dizzy)
- Pause at interesting angles
- Use mouse cursor to point at specific layers

#### Step 4: Zoom In (20 seconds)

```
Action: Scroll to zoom in on a specific layer
Say: "Let me zoom in on this convolutional layer..."
```

**What to Show:**

- Detailed view of individual layer
- Layer connections
- Clean, professional rendering

#### Step 5: Click Layer for Details (60 seconds)

```
Action: Click on a convolutional layer (e.g., "conv1")
Say: "When I click on a layer, watch what happens..."
```

**What to Show in Sidebar:**

1. **Layer Name**: "conv1"
2. **Layer Type**: "Conv2d"
3. **Parameters**: "9,408 parameters"
4. **Input Shape**: "(3, 224, 224)"
5. **Output Shape**: "(64, 112, 112)"
6. **Plain English Explanation**: Read this aloud

**Script for Explanation:**
"See this explanation? 'This convolutional layer extracts low-level features like edges and textures from the input image.' Anyone can understand this, regardless of technical background. That's educational transparency."

**What to Emphasize:**

- Plain English explanations
- Detailed technical information
- Accessibility for all skill levels

#### Step 6: Show Another Layer Type (30 seconds)

```
Action: Click on a pooling layer
Say: "Let me show you a different type of layer..."
```

**What to Show:**

- Different layer type (MaxPool2d)
- Different explanation
- How layers work together

**Transition:**
"Okay, so that's 3D visualization. Now let's see something even more interesting - real-time inference."

### Demo 1 Timing Breakdown

- Navigate: 10s
- Load model: 15s
- Rotate: 30s
- Zoom: 20s
- Click layer: 60s
- Second layer: 30s
- Transition: 5s
  **Total: ~2:50 minutes**

### Demo 1 Common Issues

**Issue**: 3D model doesn't render
**Solution**:

1. Check browser console for WebGL errors
2. Try different browser (Chrome recommended)
3. Fall back to screenshots

**Issue**: Model loads slowly
**Solution**:

1. Explain: "We're fetching the architecture..."
2. Continue talking while it loads
3. Have backup screenshot ready

**Issue**: Mouse controls don't work
**Solution**:

1. Click on 3D viewport to focus it
2. Try different mouse/trackpad
3. Use keyboard controls if available

---

## Demo 2: Real-Time Inference (4 minutes)

### Objective

Demonstrate live inference with layer-by-layer streaming visualization

### Starting Point

- URL: http://localhost:5173/inference
- Tab: "Live Inference"
- Model: ResNet-50 (selected)
- Image: golden_retriever.jpg (ready to upload)

### Step-by-Step Instructions

#### Step 1: Navigate to Inference Page (10 seconds)

```
Action: Click "Inference" in sidebar
Say: "Now let's run real-time inference on an image."
```

**What to Show:**

- Inference page layout
- Two tabs: Standard and Live Inference
- Clean interface

#### Step 2: Select Live Inference Tab (5 seconds)

```
Action: Click "Live Inference" tab
Say: "I'm selecting the Live Inference tab..."
```

**What to Show:**

- Tab switching animation
- Live Inference interface
- Upload area

#### Step 3: Select Model (10 seconds)

```
Action: Click model dropdown, select "ResNet-50"
Say: "Let me select ResNet-50 as our model."
```

**What to Show:**

- Model dropdown
- Available models
- Selection confirmation

**Note**: If model is already selected, skip this step

#### Step 4: Upload Image (20 seconds)

```
Action: Drag and drop golden_retriever.jpg OR click to browse
Say: "I'm going to upload this photo of a golden retriever..."
```

**What to Show:**

- Drag and drop functionality
- Image preview
- File name display

**Pro Tips:**

- Have image file open in Finder/Explorer beforehand
- Practice drag and drop motion
- Ensure image is clearly visible to audience

**Troubleshooting:**

- If drag-drop fails: Use click to browse
- If image doesn't preview: Check file format
- If upload is slow: Use smaller image

#### Step 5: Build Anticipation (10 seconds)

```
Action: Hover over "Run Inference" button
Say: "Now watch carefully. When I click this button, you'll see the model process this image in real-time."
```

**What to Do:**

- Pause for dramatic effect
- Make eye contact with audience
- Build suspense

#### Step 6: Run Inference (90-120 seconds)

```
Action: Click "Run Inference" button
Say: "Here we go..."
```

**What to Narrate During Inference:**

**First 5 seconds:**
"The WebSocket connection is established... the model is starting..."

**As layers process (continuous narration):**
"Look at the 3D visualization - see the signal flowing through the network? Each layer lights up as it processes the data."

**Point to Layer Activations panel:**
"On the left, you can see:

- Current layer: 'conv1'
- Activation statistics
- A heatmap showing which neurons are firing"

**As deeper layers process:**
"Now we're in the deeper layers... these extract more complex features... almost there..."

**When complete:**
"And done! The model has finished processing."

**What to Show:**

1. **3D Visualization**: Signal flow animation
2. **Layer Activations Panel**:
   - Layer name
   - Statistics (mean, max, std)
   - Activation heatmap
3. **Progress Indicator**: Layer X of Y

**Timing Management:**

- If too fast: "That was quick! Let me run it again so you can see more clearly."
- If too slow: "While this processes, let me explain what's happening..."

**Engagement Tips:**

- Point with mouse cursor
- Use hand gestures
- Make eye contact
- Show genuine excitement

#### Step 7: Show Results (30 seconds)

```
Action: Click "Predictions" tab
Say: "Let's see what the model predicted..."
```

**What to Show:**

1. **Top Prediction**: "Golden Retriever - 94.7%"
2. **Other Predictions**:
   - Labrador Retriever - 3.2%
   - Cocker Spaniel - 1.1%
   - etc.
3. **Confidence Scores**: Visual bars

**Script:**
"Top prediction: Golden Retriever with 94.7% confidence. The model is very certain. But here's the question everyone asks: WHY did it predict golden retriever? Let's find out."

**Transition:**
"Let me show you how we can understand the model's reasoning."

### Demo 2 Timing Breakdown

- Navigate: 10s
- Select tab: 5s
- Select model: 10s
- Upload image: 20s
- Build anticipation: 10s
- Run inference: 90-120s
- Show results: 30s
- Transition: 5s
  **Total: ~3:00-3:30 minutes**

### Demo 2 Common Issues

**Issue**: WebSocket connection fails
**Solution**:

1. Check backend is running
2. Check browser console
3. Refresh page and try again
4. Fall back to Standard Inference

**Issue**: Inference is too slow
**Solution**:

1. Explain: "We're computing activations for all layers..."
2. Keep narrating
3. Use smaller model (MobileNet) for faster demo

**Issue**: No results appear
**Solution**:

1. Check console for errors
2. Try different image
3. Restart backend
4. Use backup screenshots

**Issue**: Animation is choppy
**Solution**:

1. Close other applications
2. Reduce browser zoom
3. Use simpler model
4. Disable 3D animation

---

## Demo 3: Explainability (3 minutes)

### Objective

Show how Grad-CAM reveals which parts of the image the model focused on

### Starting Point

- URL: http://localhost:5173/explainability
- Image: Same golden retriever image
- Model: ResNet-50

### Step-by-Step Instructions

#### Step 1: Navigate to Explainability (10 seconds)

```
Action: Click "Explainability" in sidebar
Say: "Now let's understand WHY the model made that prediction."
```

#### Step 2: Ensure Image and Model Selected (10 seconds)

```
Action: Verify image and model are selected
Say: "I'm using the same image and model..."
```

**Note**: Image should carry over from previous demo

#### Step 3: Explain Grad-CAM (20 seconds)

```
Action: Hover over "Run Grad-CAM" button
Say: "Grad-CAM stands for Gradient-weighted Class Activation Mapping. It shows us which parts of the image the model focused on."
```

**Keep It Simple:**
"Think of it like highlighting the important parts of a text. Grad-CAM highlights the important parts of an image."

#### Step 4: Run Grad-CAM (30 seconds)

```
Action: Click "Run Grad-CAM"
Say: "Let me run this analysis..."
```

**What to Say While Processing:**
"This takes a few seconds because we're computing gradients for the target class... essentially asking the model 'what made you think this was a golden retriever?'"

#### Step 5: Show Heatmap Results (60 seconds)

```
Action: Point to heatmap overlay on image
Say: "And here's the result..."
```

**What to Point Out:**

**Red/Orange Regions:**
"The red and orange regions show where the model was 'looking'. See how it focused on:

- The dog's face - especially the eyes and nose
- The fur texture on the body
- The overall body shape"

**Blue/Cool Regions:**
"The blue regions had little influence on the decision. The background, for example, wasn't important."

**Key Message:**
"This isn't just a guess - this is mathematically derived from the model's gradients. These are the regions that most strongly activated the 'golden retriever' class."

#### Step 6: Show Layer Contributions (40 seconds)

```
Action: Switch to 3D view or layer contribution panel
Say: "And if we look at which layers contributed most..."
```

**What to Show:**

- Layers colored by contribution
- Brighter = higher contribution
- Deeper layers typically contribute more

**Script:**
"The layers are now colored by their contribution to this prediction. See how the deeper convolutional layers are brightest? That makes sense - deeper layers extract more complex, discriminative features like 'dog face' or 'golden fur'."

**Click on High-Contribution Layer:**
"This layer, for example, contributed 23% to the final prediction."

#### Step 7: Explain Importance (30 seconds)

```
Action: Gesture to overall visualization
Say: "This level of transparency is crucial for..."
```

**Three Key Points:**

1. **Debugging**: "If the model focuses on wrong regions, you know something's wrong"
2. **Trust**: "You can verify the model is making decisions for the right reasons"
3. **Compliance**: "You can document and explain model behavior to regulators"

**Transition:**
"Alright, let me switch back to the slides to wrap up."

### Demo 3 Timing Breakdown

- Navigate: 10s
- Setup: 10s
- Explain Grad-CAM: 20s
- Run analysis: 30s
- Show heatmap: 60s
- Layer contributions: 40s
- Explain importance: 30s
- Transition: 10s
  **Total: ~3:30 minutes**

### Demo 3 Common Issues

**Issue**: Grad-CAM takes too long
**Solution**:

1. Explain: "Computing gradients for all layers..."
2. Keep talking
3. Have backup screenshot

**Issue**: Heatmap doesn't show clearly
**Solution**:

1. Adjust opacity slider
2. Try different color scheme
3. Zoom in on image

**Issue**: Results don't make sense
**Solution**:

1. Explain: "Sometimes models focus on unexpected regions"
2. Use this as teaching moment
3. Try different image

---

## Demo Flow Summary

### Total Time: ~10-12 minutes

1. **3D Visualization**: 3 minutes
2. **Real-Time Inference**: 4 minutes
3. **Explainability**: 3 minutes
4. **Transitions**: 1-2 minutes

### Recommended Order

1. Start with 3D visualization (easiest, most impressive)
2. Move to inference (builds on visualization)
3. End with explainability (most complex, most impactful)

### Alternative: Shortened Demo (5-7 minutes)

If time is limited:

1. **Quick 3D tour**: 1 minute (just rotate and click one layer)
2. **Inference**: 3 minutes (focus on real-time streaming)
3. **Explainability**: 2 minutes (just show heatmap)

---

## Backup Plans

### Plan A: Full Live Demo (Preferred)

- All three demos live
- Interactive exploration
- Real-time results

### Plan B: Partial Live Demo

- Show 3D visualization live
- Use recorded video for inference
- Show explainability screenshots

### Plan C: Full Recorded Demo

- Play pre-recorded video
- Narrate over video
- Answer questions after

### Plan D: Screenshots Only

- Walk through screenshots
- Explain each step
- Offer to show live demo after presentation

---

## Practice Schedule

### 1 Week Before

- [ ] Run through full demo 3 times
- [ ] Time each section
- [ ] Identify potential issues
- [ ] Prepare backup materials

### 3 Days Before

- [ ] Practice with actual presentation setup
- [ ] Test on projector
- [ ] Record backup video
- [ ] Get feedback from colleague

### 1 Day Before

- [ ] Final practice run
- [ ] Verify all systems working
- [ ] Prepare sample images
- [ ] Charge all devices

### Day Of

- [ ] Arrive early
- [ ] Test everything again
- [ ] Do a quick run-through
- [ ] Take deep breaths

---

## Post-Demo Actions

### Immediate

- [ ] Save any interesting results
- [ ] Note any issues encountered
- [ ] Collect feedback

### After Presentation

- [ ] Review what went well
- [ ] Document any problems
- [ ] Update demo guide
- [ ] Share recordings if appropriate

---

## Demo Checklist (Print This!)

**30 Minutes Before:**

- [ ] Backend running on port 5001
- [ ] Frontend running on port 5173
- [ ] Browser open to http://localhost:5173
- [ ] Sample images ready
- [ ] Backup materials accessible
- [ ] Display connected and tested

**5 Minutes Before:**

- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Set browser to full screen
- [ ] Test mouse/trackpad
- [ ] Have water nearby
- [ ] Take deep breath

**During Demo:**

- [ ] Speak clearly and slowly
- [ ] Point with mouse cursor
- [ ] Make eye contact
- [ ] Show enthusiasm
- [ ] Handle errors gracefully

**After Demo:**

- [ ] Return to slides smoothly
- [ ] Thank audience
- [ ] Offer to show more offline

---

## Emergency Contacts

**Technical Issues:**

- Backend not starting: Check Python version, dependencies
- Frontend not loading: Check Node version, npm install
- WebSocket failing: Check ports, firewall

**Support:**

- Project documentation: /docs
- GitHub issues: [your-repo]/issues
- Your email: [your-email]

---

**Remember**: The demo is meant to impress, but don't let technical issues derail your presentation. Stay calm, use backups if needed, and focus on the message: WhyteBox makes neural networks transparent and understandable.

**You've got this! 🚀**
