import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

app = FastAPI(title="Pollution Prediction API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model safely
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')

model = None
try:
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Model loaded successfully.")
    else:
        print(f"Warning: Model not found at {MODEL_PATH}. Please run train.py first.")
except Exception as e:
    print(f"Error loading model: {str(e)}")

class PredictionInput(BaseModel):
    pm25: float
    pm10: float
    no2: float
    co: float
    temperature: float
    humidity: float
    vehicle_count: int
    speed: float

def get_risk_level(aqi):
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Moderate"
    elif aqi <= 150:
        return "Unhealthy for Sensitive Groups"
    elif aqi <= 200:
        return "Unhealthy"
    elif aqi <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

@app.get("/")
def read_root():
    return {"status": "ok", "message": "ML Service is running. Use /predict for predictions."}

@app.post("/predict")
def predict(data: PredictionInput):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded. Train the model first.")

    try:
        # Create a 2D array / DataFrame for prediction
        input_data = pd.DataFrame([{
            'pm25': data.pm25,
            'pm10': data.pm10,
            'no2': data.no2,
            'co': data.co,
            'temperature': data.temperature,
            'humidity': data.humidity,
            'vehicle_count': data.vehicle_count,
            'speed': data.speed
        }])
        
        predicted_aqi = model.predict(input_data)[0]
        
        # Round the predicted AQI
        aqi_1hr = round(float(predicted_aqi), 2)
        
        # Calculate a simple trend for 24h just as an example
        aqi_24hr = round(aqi_1hr * 1.1, 2)
        
        risk_level = get_risk_level(aqi_1hr)

        return {
            "aqi_1hr": aqi_1hr,
            "aqi_24hr": aqi_24hr,
            "risk_level": risk_level
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
