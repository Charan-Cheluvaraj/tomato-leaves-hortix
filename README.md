# Smart Crop Disease Detection & Advisory System (Hortix Intelligence OS) 🌿

Hortix is a high-fidelity, real-world AI ecosystem designed to assist farmers in detecting plant diseases and receiving actionable agricultural guidance. This project integrates custom-trained deep learning models with advanced Large Language Models (Gemini) to provide a complete diagnostic and advisory experience.

---

## 🚀 1. Machine Learning Model (MANDATORY)

The system utilizes a dedicated neural network trained specifically for plant pathology detection.

- **Model Architecture**: **Transfer Learning** using **MobileNetV2**.
  - We leverage the pre-trained weights from ImageNet for feature extraction.
  - Custom top layers include `GlobalAveragePooling2D`, a `Dense` layer of 128 units (ReLU), and a `Softmax` output layer corresponding to the number of disease classes.
- **Dataset**: Integrated with datasets like **PlantVillage**, covering various tomato leaf conditions (e.g., Early Blight, Late Blight, Target Spot, Healthy).
- **Preprocessing Pipeline**:
  - Image Rescaling (1./255).
  - **Data Augmentation**: Rotation, width/height shifts, and horizontal flips to ensure model robustness in varied field lighting conditions.
  - Validation Split: 80/20 train-validation ratio.
- **Output**: The model returns the predicted disease name and a confidence score (e.g., `Confidence: 0.94`).

## 🧠 2. LLM Integration (Gemini API)

Once the ML model performs the primary diagnosis, the result is passed to the **Google Gemini API** to generate high-value agricultural intelligence.

- **Dynamic Advisory**: Gemini translates technical disease names into localized, simple language for farmers.
- **Actionable Insights**: The system generates:
  - **Disease Explanation**: Simple terms describing the condition.
  - **Remedies**: Practical, immediate steps to treat the crop.
  - **Preventive Measures**: Long-term strategies to avoid recurrence.
- **Prompt Engineering**: We use structured prompts that ensure the response is concise, practical, and farmer-centric.

## 💻 3. Frontend (Working Prototype)

The user interface is a cinematic **Intelligence HUD** built with Vanilla HTML/CSS/JS for maximum performance and visual fidelity.

- **Core UI Features**:
  - **Live Image Upload**: Drag-and-drop or click-to-upload interface.
  - **Diagnostic Portal**: Displays the ML-detected disease and confidence score immediately.
  - **Tactical Advice Panel**: Streams the AI-generated report using **Skeleton Shimmer Loading** to maintain a smooth user experience during inference.

## 💬 4. Interactive AI Queries (IMPORTANT)

Hortix features a persistent **Interactive Query Portal** allowing users to ask follow-up questions dynamically.

- **Context-Aware Chat**: Users can ask specific questions like *"How can I prevent it?"* or *"What chemicals should I avoid?"*.
- **Suggested Actions**: Clickable tactical chips for common follow-ups:
  - *"What is this disease?"*
  - *"How can I treat it?"*
  - *"How can I prevent it?"*

## 🔄 5. System Flow (IMPORTANT)

The operation of Hortix follows a strict, logical pipeline:

1.  **Image → ML Model**: The user uploads a leaf image. The backend pre-processes the image into a 224x224 tensor and feeds it to the **MobileNetV2** model.
2.  **ML Model → Prediction**: The model predicts the class with the highest probability. If the confidence is high, it proceed to the intelligence phase.
3.  **Prediction → LLM**: The predicted class (e.g., "Tomato Late Blight") is injected into an instruction-tuned prompt sent to Gemini.
4.  **LLM → Response**: Gemini streams the agricultural advice (explanation, remedies, prevention) back to the client via SSE (Server-Sent Events).
5.  **UI Interaction**: The frontend manages the state, displaying skeleton loaders, rendering the streaming text, and enabling follow-up chat capabilities.

---

## 🛠 Technical Expectations & Checklist

- [x] **Working ML Model**: Custom-trained using TensorFlow (not a third-party detection API).
- [x] **Clean Integration**: Seamless handoff from ML classification to LLM advisory.
- [x] **No Hardcoded Outputs**: Every response is generated dynamically based on the specific scan result.
- [x] **Interactive Interface**: Fully functional follow-up chat portal.

---
*Built for the future of sustainable agriculture.*
