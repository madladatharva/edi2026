import csv
import json
import random
import os
from datetime import datetime, timedelta

# Owner: [Placeholder Member B]
# Generates a synthetic but highly realistic dataset, now including 45 zones and 30-day time-series history.

random.seed(42)
NUM_ZONES = 45
BASE_LAT = 18.5204
BASE_LON = 73.8567
BASE_ELEVATION = 560.0

def generate_zones():
    zones = []
    for i in range(NUM_ZONES):
        lat = BASE_LAT + random.uniform(-0.06, 0.06)
        lon = BASE_LON + random.uniform(-0.06, 0.06)
        elevation = round(BASE_ELEVATION + random.uniform(-25.0, 20.0), 2)
        drainage = random.randint(1, 5)
        
        zones.append({
            "zone_id": f"Z-{i+1:03d}",
            "name": f"Pune Sub-Zone {i+1}",
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "elevation_m": elevation,
            "drainage_capacity_score": drainage
        })
    return zones

def generate_data(zones):
    ts_data = []
    static_data = []
    
    start_time = datetime(2023, 6, 1, 0, 0)
    hours = 30 * 24 # 30 days
    
    # Ward rain pattern (monsoon simulation)
    ward_rain = []
    for h in range(hours):
        if random.random() < 0.05: # 5% chance of a rain event starting
            duration = random.randint(2, 8)
            intensity = random.uniform(10.0, 50.0)
            ward_rain.extend([intensity * random.uniform(0.5, 1.5) for _ in range(duration)])
        else:
            if len(ward_rain) <= h:
                ward_rain.append(0.0)
    ward_rain = ward_rain[:hours]
    
    for z in zones:
        historical_incidents = 0
        current_rain = 0.0
        rolling = [0.0, 0.0, 0.0]
        
        for h in range(hours):
            # Zone-specific micro-variation
            r = round(max(0, ward_rain[h] + random.uniform(-5.0, 5.0)), 2) if ward_rain[h] > 0 else 0.0
            rolling.pop(0)
            rolling.append(r)
            accumulated = sum(rolling)
            
            # Learnable heuristic target logic
            elev_penalty = max(0, 575 - z["elevation_m"])
            drain_penalty = (5 - z["drainage_capacity_score"]) * 10
            
            risk_score = accumulated + elev_penalty + drain_penalty + random.uniform(-10, 10)
            flood_flag = 1 if risk_score > 90 else 0
            
            if flood_flag == 1:
                historical_incidents += 1
                
            ts_data.append({
                "zone_id": z["zone_id"],
                "timestamp": (start_time + timedelta(hours=h)).strftime("%Y-%m-%d %H:%M:%S"),
                "rainfall_mm": r,
                "elevation_m": z["elevation_m"],
                "drainage_capacity_score": z["drainage_capacity_score"],
                "flood_incident_flag": flood_flag
            })
            
            if h == hours - 1:
                current_rain = r
                
        static_data.append({
            "zone_id": z["zone_id"],
            "name": z["name"],
            "latitude": z["latitude"],
            "longitude": z["longitude"],
            "elevation_m": z["elevation_m"],
            "drainage_capacity_score": z["drainage_capacity_score"],
            "historical_flood_incidents": historical_incidents,
            "current_rainfall_mm": current_rain
        })
        
    return static_data, ts_data

if __name__ == "__main__":
    os.makedirs('processed', exist_ok=True)
    zones = generate_zones()
    static, ts = generate_data(zones)
    
    with open('processed/zones.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=static[0].keys())
        w.writeheader()
        w.writerows(static)
        
    with open('processed/zones_timeseries.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=ts[0].keys())
        w.writeheader()
        w.writerows(ts)
        
    print(f"✅ Success: Generated {len(static)} static zones and {len(ts)} time-series records.")
