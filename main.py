import os
import json
import io
import asyncio
import numpy as np
import tensorflow as tf
import google.generativeai as genai
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from PIL import Image
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Hortix Intelligence OS")

# --- Configuration & Environment ---
# Key is now loaded from .env file (secured and ignored by git)
NEW_GEMINI_KEY = os.getenv("NEW_GEMINI_KEY")
if not NEW_GEMINI_KEY:
    print("WARNING: NEW_GEMINI_KEY not found in environment. AI features will fail.")
else:
    genai.configure(api_key=NEW_GEMINI_KEY)

# Models to attempt in order of preference
# DISCOVERY: Diagnostic script found 'gemini-3.1-flash-live-preview' and 'gemini-2.5-flash-native-audio-preview-12-2025'
STABLE_MODELS = [
    'gemini-3.1-flash-live-preview',
    'gemini-2.5-flash-native-audio-preview-12-2025',
    'gemini-1.5-flash-latest', 
    'gemini-1.5-flash',
    'gemini-pro'
]

def get_best_model():
    """
    Scans available models for the key and returns the first one that supports generation.
    """
    try:
        available = [m.name.replace('models/', '') for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        print(f"Discovered available models: {available}")
        for preference in STABLE_MODELS:
            if preference in available:
                print(f"Selected primary intelligence agent: {preference}")
                return preference
        return available[0] if available else 'gemini-1.5-flash'
    except Exception as e:
        print(f"Model discovery failure: {e}. Defaulting to hardcoded chain.")
        return STABLE_MODELS[0]

# Local Knowledge Base for Offline/Quota Fallback (Premium Fidelity)
OFFLINE_INTEL = {
    "Tomato Early blight": """
[OFFLINE DIAGNOSTIC PROTOCOL ACTIVE - LOCAL TELMETRY]
EXPLANATION: Fungal infection (Alternaria solani). Identified by concentric 'target' spots on lower foliage. If left untreated, it leads to significant defoliation and reduced fruit yield.
REMEDIES:
1. BIO-CONTROL: Apply Neem oil or Bacillus subtilis-based sprays.
2. CHEMICAL: Use Copper Fungicides or Chlorothalonil on a 7-10 day cycle.
3. PRUNING: Remove all infected lower leaves to prevent spore splash-back.
PREVENTION: Increase spacing to 24 inches for airflow. Avoid overhead watering; use drip irrigation to keep foliage dry.
""",
    "Tomato Late blight": """
[OFFLINE DIAGNOSTIC PROTOCOL ACTIVE - LOCAL TELMETRY]
EXPLANATION: Critical Threat (Phytophthora infestans). This is the same pathogen responsible for the Irish Potato Famine. Characterized by rapid tissue rot and gray mold on leaf undersides.
REMEDIES:
1. QUARANTINE: Immediately remove and bag infected plants. Do NOT compost.
2. TREATMENT: Apply fungicides containing Mancozeb or Famoxadone + Cymoxanil.
3. SANITATION: Clean all tools with 10% bleach solution after contact.
PREVENTION: Plant resistant cultivars. Monitor humidity; Late Blight thrives in cool, wet conditions (relative humidity >90%).
""",
    "Tomato healthy": """
[OFFLINE DIAGNOSTIC PROTOCOL ACTIVE - LOCAL TELMETRY]
STATUS: OPTIMAL VIGOR DETECTED.
ADVICE: No pathogenic signatures found. Maintain current Nitrogen-Phosphorus-Potassium (NPK) ratios. 
MONITORING: Continue bi-weekly visual inspections for aphids or early fungal signs.
"""
}

# --- System Setup ---
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/vids", StaticFiles(directory="vids"), name="vids")

MODEL_PATH = 'models/plant_model.h5'
CLASS_NAMES_PATH = 'models/class_names.json'
IMG_SIZE = (224, 224)

print("Initializing Neural Core...")
model = tf.keras.models.load_model(MODEL_PATH, compile=False)

with open(CLASS_NAMES_PATH, 'r') as f:
    class_names = json.load(f)

# --- Helper Functions ---

def preprocess_image(image_bytes: bytes):
    image = Image.open(io.BytesIO(image_bytes))
    if image.mode != "RGB":
        image = image.convert("RGB")
    image = image.resize(IMG_SIZE)
    img_array = np.array(image)
    img_array = img_array.astype(np.float32) / 255.0
    return np.expand_dims(img_array, axis=0)

async def stream_gemini_advice(disease_name: str):
    """
    Tries discovered Gemini models before failing over to local knowledge base.
    """
    model_to_use = get_best_model()
    
    prompt = (
        f"The detected plant disease is {disease_name}. In simple terms for a farmer, provide: "
        "1. A brief explanation of the disease. "
        "2. 3-4 practical remedies. "
        "3. Preventive measures. "
        "Use a professional, helpful tone. Keep it actionable."
    )

    success = False
    try:
        print(f"Deploying AI Agent: {model_to_use}...")
        m = genai.GenerativeModel(model_to_use)
        
        # We wrap the generator to catch any late-breaking quota/429 errors
        response = m.generate_content(prompt, stream=True)
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
                success = True
        
        if success:
            return

    except Exception as e:
        print(f"AI Agent Failure ({model_to_use}): {e}")

    # Final Fallback if all AI agents fail
    print("AI Agents Offline. Triggering Hardware Fallback Protocol.")
    fallback_text = OFFLINE_INTEL.get(disease_name, "Intelligence Module Timeout. Please consult a local agricultural specialist.")
    
    # Prefix the fallback text so the user knows it's from local cache
    header = "[RESILIENCE MODE: DATA PULLED FROM LOCAL HUD CACHE]\n\n"
    for char in header + fallback_text:
        yield char
        await asyncio.sleep(0.002)

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"status": "ONLINE", "version": "2.1.0"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    FAST PATH: Returns only the ML classification.
    """
    contents = await file.read()
    processed_image = preprocess_image(contents)
    predictions = model.predict(processed_image)
    predicted_index = str(np.argmax(predictions[0]))
    confidence = float(np.max(predictions[0]))
    
    disease_id = class_names.get(predicted_index, "Unknown Disease")
    formatted_name = disease_id.replace("___", " ").replace("_", " ")

    return {
        "disease_name": formatted_name,
        "confidence": confidence,
        "raw_class": disease_id
    }

@app.get("/advice")
async def get_advice(disease_name: str):
    """
    STREAMING PATH: Delivers advisory intelligence.
    """
    return StreamingResponse(
        stream_gemini_advice(disease_name),
        media_type="text/plain"
    )

class ChatRequest(BaseModel):
    user_question: str
    detected_disease: str

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Follow-up chat also benefits from fallback logic.
    """
    async def chat_stream():
        prompt = (
            f"Context: {request.detected_disease}.\n"
            f"Question: {request.user_question}\n"
            "Provide a concise, helpful answer."
        )
        try:
            model_to_use = get_best_model()
            m = genai.GenerativeModel(model_to_use)
            response = m.generate_content(prompt, stream=True)
            for chunk in response:
                if chunk.text:
                    yield chunk.text
        except:
            yield "\n\n[COMMUNICATION ERROR] AI recalibration required. Local diagnostics recommend checking irrigation patterns and soil pH in the meantime."

    return StreamingResponse(chat_stream(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    # Clean start: port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
