# Hortix Intelligence OS 🌿
### *High-Fidelity AI Plant Pathology HUD*

Hortix is a cinematic, hardware-accelerated intelligence dashboard designed for real-time diagnosis and interactive advisory of tomato leaf diseases. By fusing advanced deep learning (TensorFlow) with Large Language Models (Google Gemini), Hortix transforms raw diagnostic data into a tactical, interactive experience for precision agriculture.

---

## ✨ Key Features

- **Cinematic Intelligence HUD**: A high-end dashboard inspired by industrial brutalism and modern terminal aesthetics, featuring a responsive tactical grid.
- **Micro-Inference System**: Real-time leaf scanning utilizing optimized neural networks for precise disease classification.
- **Interactive AI Advisory**: A persistent chat portal powered by Gemini Flash allows users to ask follow-up questions about treatments, prevention, and localized care.
- **Hardware-Accelerated UI**: Custom Gleam/Shimmer skeleton loaders provide a seamless experience during LLM inference, ensuring zero-latency "perceived" interaction.
- **Global HUD Fluidity**: Optimized flex-box architecture ensures all interactive elements (Suggested Questions, Chat Input) remain accessible via global tactical scrolling.

## 🛠 Tech Stack

- **Frontend**: 
  - Vanilla JavaScript (ES6+) for logic.
  - High-End CSS3 with GPU-accelerated animations and glassmorphism.
  - Custom cinematic scroll-management.
- **Backend**: 
  - **FastAPI**: Asynchronous, high-performance API core.
  - **TensorFlow/Keras**: Deep learning engine for leaf pathology classification.
  - **Google Gemini API**: Dynamic intelligence layer for streaming advisory reports.
- **Communication**: SSE (Server-Sent Events) for real-time streaming of AI insights.

## 🚀 Getting Started

### Prerequisites
- **Python 3.9+**
- **Google AI (Gemini) API Key** (Accessible via [Google AI Studio](https://aistudio.google.com/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Charan-Cheluvaraj/tomato-leaves-hortix.git
   cd tomato-leaves-hortix
   ```

2. **Set up your environment**:
   Create a `.env` file or export your Gemini API key:
   ```bash
   NEW_GEMINI_KEY=your_gemini_api_key_here
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the Intelligence OS**:
   ```bash
   python main.py
   ```

5. **Initialize HUD**:
   Open your browser and navigate to `http://localhost:8000`.

## 📂 Project Structure

- `main.py`: The central Intelligence server, managing inference routes and AI streaming.
- `static/`: High-fidelity dashboard assets.
  - `app.js`: HUD lifecycle and interaction management.
  - `styles.css`: The cinematic aesthetic engine.
  - `index.html`: The structural foundation of the Tactical Grid.
- `models/`: Directory containing pre-trained `.h5` neural network weights.
- `train_model.py`: Training pipeline for expanding the Hortix knowledge base with new plant classes.

## 🤝 Contributing

Contributions to the Hortix Intelligence core are welcome. To maintain the project's visual standards, ensure all UI modifications adhere to the established industrial aesthetic and maintain 60fps interaction fidelity.

---
*Built with ❤️ for sustainable agriculture and precision farming.*
