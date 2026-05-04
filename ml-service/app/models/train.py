import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(MODEL_DIR, "../data/pollution_data.csv")

def train_model():
    df = pd.read_csv(DATA_FILE)
    
    # Feature engineering
    X = df[['pm25', 'pm10', 'no2', 'co', 'temperature', 'humidity', 'vehicle_count', 'speed']]
    y = df['aqi']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    predictions = model.predict(X_test)
    mse = mean_squared_error(y_test, predictions)
    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)
    
    # Save model
    joblib.dump(model, os.path.join(MODEL_DIR, 'saved_model.pkl'))
    
    return {"rmse": np.sqrt(mse), "mae": mae, "r2": r2}

if __name__ == "__main__":
    print(train_model())
