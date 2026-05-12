import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# --- Constants & Definitions ---
np.random.seed(42)
random.seed(42)

LOCATIONS = [
    {"area_name": "Whitefield", "latitude": 12.9698, "longitude": 77.7499, "zone_type": "IT Corridor", "road_type": "Arterial"},
    {"area_name": "Peenya", "latitude": 13.0285, "longitude": 77.5197, "zone_type": "Industrial", "road_type": "Highway"},
    {"area_name": "Jayanagar", "latitude": 12.9299, "longitude": 77.5826, "zone_type": "Residential", "road_type": "City Road"},
    {"area_name": "Mysuru Highway", "latitude": 12.3923, "longitude": 76.6570, "zone_type": "Highway", "road_type": "Expressway"},
    {"area_name": "Electronic City", "latitude": 12.8452, "longitude": 77.6602, "zone_type": "IT Corridor", "road_type": "Arterial"},
    {"area_name": "Majestic", "latitude": 12.9766, "longitude": 77.5713, "zone_type": "Commercial", "road_type": "City Road"}
]

# Generate exactly 2 years of hourly data -> 24 * 365 * 2 = 17520 rows per location.
# Total rows = 17520 * 6 = 105,120 rows (Well over 50,000 requirement)
START_DATE = datetime(2023, 1, 1)
HOURS = 24 * 365 * 2

def get_season(month):
    if month in [3, 4, 5]: return "Summer"
    elif month in [6, 7, 8, 9]: return "Monsoon"
    elif month in [10, 11]: return "Post-Monsoon"
    else: return "Winter"

def calculate_aqi_subindex(pm25, pm10, no2, co, so2, o3):
    # A simplified but realistic maximum-sub-index proxy for Indian AQI
    # Scale factors chosen to align roughly with typical CPCB breakpoints
    ipm25 = pm25 * 100 / 60
    ipm10 = pm10 * 100 / 100
    ino2 = no2 * 100 / 80
    ico = co * 100 / 4
    iso2 = so2 * 100 / 80
    io3 = o3 * 100 / 100
    return max(ipm25, ipm10, ino2, ico, iso2, io3)

def get_risk_level(aqi):
    if aqi <= 50: return "Low"
    elif aqi <= 100: return "Moderate"
    elif aqi <= 200: return "High"
    else: return "Severe"

def generate_data():
    records = []
    
    # Generate timestamp sequence once
    timestamps = [START_DATE + timedelta(hours=i) for i in range(HOURS)]
    
    print(f"Generating synthetic dataset with {len(timestamps) * len(LOCATIONS)} rows...")

    for loc in LOCATIONS:
        print(f"Generating data for {loc['area_name']}...")
        
        # Base zone modifiers
        zone = loc["zone_type"]
        base_pm_multiplier = 1.5 if zone == "Industrial" else 1.2 if zone == "Commercial" else 1.0 if zone == "IT Corridor" else 0.7
        base_traffic = 2000 if zone in ["Commercial", "IT Corridor"] else 3000 if zone == "Highway" else 800
        heavy_vehicle_ratio = 0.4 if zone in ["Industrial", "Highway"] else 0.1
        
        for ts in timestamps:
            hour = ts.hour
            weekday = ts.weekday()
            month = ts.month
            season = get_season(month)
            
            is_weekend = weekday >= 5
            is_holiday = is_weekend or (random.random() < 0.03) # 3% chance of public holiday
            
            # Traffic Logic
            is_morning_peak = 8 <= hour <= 11
            is_evening_peak = 17 <= hour <= 20
            peak_hour_flag = 1 if (is_morning_peak or is_evening_peak) and not is_holiday else 0
            
            traffic_modifier = 1.5 if peak_hour_flag else 0.4 if (23 <= hour or hour <= 5) else 0.8
            if is_holiday: traffic_modifier *= 0.6
            
            vehicle_count = int(base_traffic * traffic_modifier * np.random.normal(1.0, 0.1))
            heavy_vehicle_count = int(vehicle_count * heavy_vehicle_ratio * np.random.normal(1.0, 0.2))
            
            # In peak hours or high traffic, speed drops, congestion rises
            congestion_level = min(100, max(0, (vehicle_count / (base_traffic * 1.5)) * 100 + np.random.normal(0, 5)))
            avg_vehicle_speed = max(5, 60 - (congestion_level * 0.5) + np.random.normal(0, 5))
            signal_wait_time = max(0, (congestion_level * 1.2) + np.random.normal(0, 10))
            
            # Weather Logic
            temp_base = 30 if season == "Summer" else 24 if season == "Monsoon" else 20
            temp = temp_base + np.random.normal(0, 2) + (5 if 12 <= hour <= 15 else -3)
            
            humidity = 80 if season == "Monsoon" else 40 if season == "Summer" else 60
            humidity = max(20, min(100, humidity + np.random.normal(0, 10) + (10 if hour < 8 else -10)))
            
            # Rainfall logic (mostly in monsoon, rare otherwise)
            rainfall = 0
            if season == "Monsoon" and random.random() < 0.3:
                rainfall = max(0, np.random.normal(10, 5))
            elif random.random() < 0.05:
                rainfall = max(0, np.random.normal(2, 2))
                
            wind_speed = max(0, np.random.normal(10, 4) + (5 if season == "Monsoon" else 0))
            pressure = np.random.normal(1010, 5)
            visibility = max(1, 10 - (rainfall * 0.2) - (0.5 if season == "Winter" and hour < 8 else 0)) # fog in winter mornings
            uv_index = max(0, min(11, (10 if 11 <= hour <= 15 else 0) * (1 - (humidity/200)) + np.random.normal(0,1)))
            if hour < 6 or hour > 18: uv_index = 0
            
            # Pollution Logic (Weather & Traffic Impact)
            rain_washout = max(0.2, 1.0 - (rainfall * 0.05)) # Rain washes out particulate matter
            inversion = 1.5 if season == "Winter" and (hour < 8 or hour > 20) else 1.0 # Winter temperature inversion traps pollution
            wind_dispersion = max(0.5, 1.0 - (wind_speed * 0.02))
            
            pm25 = max(5, (20 + (congestion_level * 0.5) + (heavy_vehicle_count * 0.05)) * base_pm_multiplier * rain_washout * inversion * wind_dispersion + np.random.normal(0, 5))
            pm10 = max(10, pm25 * 1.8 + np.random.normal(0, 10))
            co = max(0.1, (0.5 + (congestion_level * 0.02)) * wind_dispersion + np.random.normal(0, 0.2))
            no2 = max(5, (15 + (heavy_vehicle_count * 0.1) + (congestion_level * 0.2)) * wind_dispersion + np.random.normal(0, 5))
            so2 = max(2, (10 if zone == "Industrial" else 2) + (heavy_vehicle_count * 0.05) + np.random.normal(0, 2))
            o3 = max(5, (10 + (uv_index * 5) + (no2 * 0.1)) + np.random.normal(0, 5)) # O3 forms with sunlight and NO2
            co2 = max(400, 400 + (congestion_level * 2) + (heavy_vehicle_count * 1) + np.random.normal(0, 10))
            
            aqi = calculate_aqi_subindex(pm25, pm10, no2, co, so2, o3)
            risk_level = get_risk_level(aqi)
            
            hotspot_prob = 1 / (1 + np.exp(-((aqi - 100) * 0.02 + (congestion_level - 50) * 0.05)))
            
            records.append({
                "timestamp": ts,
                "hour": hour,
                "day": ts.day,
                "weekday": weekday,
                "month": month,
                "season": season,
                "peak_hour_flag": peak_hour_flag,
                "holiday_flag": 1 if is_holiday else 0,
                
                "latitude": loc["latitude"],
                "longitude": loc["longitude"],
                "area_name": loc["area_name"],
                "road_type": loc["road_type"],
                "zone_type": loc["zone_type"],
                
                "temperature": round(temp, 1),
                "humidity": round(humidity, 1),
                "wind_speed": round(wind_speed, 1),
                "rainfall": round(rainfall, 2),
                "pressure": round(pressure, 1),
                "visibility": round(visibility, 1),
                "uv_index": round(uv_index, 1),
                
                "vehicle_count": int(vehicle_count),
                "heavy_vehicle_count": int(heavy_vehicle_count),
                "avg_vehicle_speed": round(avg_vehicle_speed, 1),
                "traffic_density": round(congestion_level, 1),
                "congestion_level": round(congestion_level, 1),
                "signal_wait_time": round(signal_wait_time, 1),
                
                "pm25": round(pm25, 2),
                "pm10": round(pm10, 2),
                "co": round(co, 2),
                "co2": round(co2, 2),
                "nox": round(no2 * 1.5, 2), # Simplified NOX derived from NO2
                "no2": round(no2, 2),
                "so2": round(so2, 2),
                "o3": round(o3, 2),
                
                "aqi": round(aqi, 1),
                "pollution_risk_level": risk_level,
                "hotspot_probability": round(hotspot_prob, 3)
            })

    df = pd.DataFrame(records)
    
    print("Calculating future pollution trends using rolling windows...")
    # Calculate future trend (look ahead 3 hours)
    df = df.sort_values(by=['area_name', 'timestamp']).reset_index(drop=True)
    df['future_aqi'] = df.groupby('area_name')['aqi'].shift(-3)
    
    def get_trend(row):
        if pd.isna(row['future_aqi']): return "stable"
        diff = row['future_aqi'] - row['aqi']
        if diff > 15: return "increasing"
        elif diff < -15: return "decreasing"
        else: return "stable"
        
    df['future_pollution_trend'] = df.apply(get_trend, axis=1)
    df = df.drop(columns=['future_aqi', 'no2']) # drop temporary and redundant columns
    
    # Rename aqi for specific target request
    df['predicted_aqi'] = df['aqi'] 
    
    # Save raw dataset
    raw_path = os.path.join(os.path.dirname(__file__), 'dataset.csv')
    df.to_csv(raw_path, index=False)
    print(f"Raw dataset saved to {raw_path} ({len(df)} rows)")
    
    # Preprocessing for cleaned_dataset
    print("Preparing cleaned ML-ready dataset...")
    # Drop pure timestamps for ML, keep cyclical encoded time features
    clean_df = df.copy()
    clean_df['hour_sin'] = np.sin(2 * np.pi * clean_df['hour']/24)
    clean_df['hour_cos'] = np.cos(2 * np.pi * clean_df['hour']/24)
    clean_df['month_sin'] = np.sin(2 * np.pi * clean_df['month']/12)
    clean_df['month_cos'] = np.cos(2 * np.pi * clean_df['month']/12)
    
    # One-hot encode categoricals
    clean_df = pd.get_dummies(clean_df, columns=['season', 'zone_type', 'road_type', 'area_name'])
    
    # Drop non-ML columns
    clean_df = clean_df.drop(columns=['timestamp'])
    
    clean_path = os.path.join(os.path.dirname(__file__), 'cleaned_dataset.csv')
    clean_df.to_csv(clean_path, index=False)
    print(f"Cleaned dataset saved to {clean_path}")
    print("Dataset generation complete!")

if __name__ == "__main__":
    generate_data()
