import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

def generate_realistic_dataset(num_records=5000):
    np.random.seed(42)
    
    zones = ['Zone A', 'Zone B', 'Zone C', 'Zone D']
    
    # Start date 6 months ago
    start_date = datetime.now() - timedelta(days=200)
    
    data = []
    
    for i in range(num_records):
        # Time features
        current_time = start_date + timedelta(hours=i)
        hour = current_time.hour
        
        # Rush hour logic (peaks at 8-10 AM and 5-7 PM)
        is_rush_hour = (8 <= hour <= 10) or (17 <= hour <= 19)
        
        zone = np.random.choice(zones)
        
        # Vehicle count and speed are inversely related
        base_vehicles = np.random.normal(800, 200)
        vehicle_count = int(base_vehicles * (2.5 if is_rush_hour else 1.0))
        vehicle_count = max(100, min(vehicle_count, 5000)) # Clamp values
        
        speed = max(5, 80 - (vehicle_count / 50) + np.random.normal(0, 5))
        
        # Weather
        temperature = np.random.normal(28, 5) + (5 if 12 <= hour <= 15 else 0)
        humidity = np.random.normal(60, 15)
        
        # Pollutants (correlated with vehicles, inversely with speed and temp)
        traffic_factor = vehicle_count / 1000
        speed_factor = max(1, 80 / speed)
        
        pm25 = max(10, 20 + (traffic_factor * 15 * speed_factor) + np.random.normal(0, 5))
        pm10 = pm25 * 1.5 + np.random.normal(5, 5)
        no2 = max(5, 10 + (traffic_factor * 8 * speed_factor) + np.random.normal(0, 3))
        co = max(0.1, 0.5 + (traffic_factor * 0.4 * speed_factor) + np.random.normal(0, 0.1))
        
        # Calculate a simplified AQI (Max sub-index)
        # Assuming linear scales for simplicity in this mock dataset
        aqi_pm25 = pm25 * 2.5
        aqi_pm10 = pm10 * 1.2
        aqi_no2 = no2 * 1.5
        aqi_co = co * 50
        
        aqi = int(max(aqi_pm25, aqi_pm10, aqi_no2, aqi_co) + np.random.normal(0, 5))
        
        data.append({
            'timestamp': current_time.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'zone': zone,
            'pm25': round(pm25, 2),
            'pm10': round(pm10, 2),
            'no2': round(no2, 2),
            'co': round(co, 2),
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 1),
            'vehicle_count': vehicle_count,
            'speed': round(speed, 1),
            'aqi': aqi
        })
        
    df = pd.DataFrame(data)
    
    # Save to CSV
    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pollution_data.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated realistic dataset with {num_records} records at {output_path}")
    print(df.head())
    print("\nDataset Summary:")
    print(df.describe())

if __name__ == "__main__":
    generate_realistic_dataset()
