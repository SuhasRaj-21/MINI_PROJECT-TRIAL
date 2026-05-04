from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
from app.models.predict import predict_aqi
from app.models.train import train_model

app = FastAPI(title="Pollution Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionInput(BaseModel):
    pm25: float
    pm10: float
    no2: float
    co: float
    temperature: float
    humidity: float
    vehicle_count: int
    speed: float

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ML Service is running"}

@app.post("/predict")
def predict(data: PredictionInput):
    try:
        input_df = pd.DataFrame([data.dict()])
        prediction = predict_aqi(input_df)
        return {
            "predicted_aqi_1hr": prediction["aqi_1hr"],
            "predicted_aqi_24hr": prediction["aqi_24hr"],
            "risk_level": prediction["risk_level"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
def train():
    try:
        metrics = train_model()
        return {"status": "success", "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
