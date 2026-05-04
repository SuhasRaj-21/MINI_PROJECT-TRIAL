import joblib
import os
import pandas as pd

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(MODEL_DIR, 'saved_model.pkl')

def get_risk_level(aqi):
    if aqi <= 50: return "Good"
    if aqi <= 100: return "Moderate"
    if aqi <= 150: return "Unhealthy for Sensitive Groups"
    if aqi <= 200: return "Unhealthy"
    if aqi <= 300: return "Very Unhealthy"
    return "Hazardous"

def predict_aqi(input_data: pd.DataFrame):
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model not trained yet. Call /train first.")
        
    model = joblib.load(MODEL_PATH)
    prediction = model.predict(input_data)[0]
    
    # Adding some simple variance for 24hr prediction for mock purposes
    prediction_24hr = prediction * 1.1 
    
    return {
        "aqi_1hr": round(prediction, 2),
        "aqi_24hr": round(prediction_24hr, 2),
        "risk_level": get_risk_level(prediction)
    }
