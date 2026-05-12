import os
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split
import joblib

def generate_dummy_data(file_path, num_samples=1000):
    np.random.seed(42)
    data = {
        'pm25': np.random.uniform(10, 200, num_samples),
        'pm10': np.random.uniform(20, 300, num_samples),
        'nox': np.random.uniform(5, 100, num_samples),
        'co': np.random.uniform(0.1, 10, num_samples),
        'temperature': np.random.uniform(15, 45, num_samples),
        'humidity': np.random.uniform(20, 90, num_samples),
        'vehicle_count': np.random.randint(50, 500, num_samples),
        'avg_vehicle_speed': np.random.uniform(10, 80, num_samples)
    }
    df = pd.DataFrame(data)
    # Simple linear combination with some noise to represent AQI
    df['aqi'] = (df['pm25'] * 0.5 + df['pm10'] * 0.3 + df['nox'] * 0.1 + df['co'] * 5 + 
                 (df['vehicle_count'] / 10) - df['avg_vehicle_speed'] * 0.2 + np.random.normal(0, 10, num_samples))
    
    # Ensure AQI is positive
    df['aqi'] = df['aqi'].clip(lower=10)
    
    df.to_csv(file_path, index=False)
    print(f"Generated dummy dataset with {num_samples} samples at {file_path}")

def train_and_save_model():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.join(base_dir, 'dataset.csv')
    model_path = os.path.join(base_dir, 'model.pkl')

    if not os.path.exists(dataset_path):
        print(f"Dataset not found at {dataset_path}. Generating dummy data...")
        generate_dummy_data(dataset_path)

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)

    features = ['pm25', 'pm10', 'nox', 'co', 'temperature', 'humidity', 'vehicle_count', 'avg_vehicle_speed']
    target = 'aqi'

    X = df[features]
    y = df[target]

    print("Splitting data into train and test sets...")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training Advanced XGBoost Regressor model...")
    model = XGBRegressor(n_estimators=200, learning_rate=0.05, max_depth=6, random_state=42)
    model.fit(X_train, y_train)

    score = model.score(X_test, y_test)
    print(f"XGBoost Model trained successfully! Test R^2 Score: {score:.4f}")

    print(f"Saving model to {model_path}...")
    joblib.dump(model, model_path)
    print("Model saved successfully!")

if __name__ == "__main__":
    try:
        train_and_save_model()
    except Exception as e:
        print(f"Error during training: {str(e)}")
