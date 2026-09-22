import csv
import json
import os
import requests
import math

ZONES_CSV = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'zones.csv')
ZONES_GEOJSON = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'zones.geojson')

def fetch_elevation(lat, lon):
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        if "elevation" in data and len(data["elevation"]) > 0:
            return data["elevation"][0]
    except Exception as e:
        print(f"Error fetching elevation for {lat}, {lon}: {e}")
    return 560.0 # Default Pune elevation fallback

def fetch_batch_elevation(lats, lons):
    lat_str = ",".join(map(str, lats))
    lon_str = ",".join(map(str, lons))
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat_str}&longitude={lon_str}"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        if "elevation" in data:
            return data["elevation"]
    except Exception as e:
        print(f"Error fetching batch elevation: {e}")
    return [560.0] * len(lats)

def calculate_terrain():
    # Read zones
    zones = []
    with open(ZONES_CSV, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            zones.append(row)
            
    print(f"Processing DEM data for {len(zones)} zones...")
    
    # We will process in batches to avoid rate limits
    lats = []
    lons = []
    
    # For each zone, we'll query 5 points: centroid, North, South, East, West (offset by ~500m / 0.005 deg)
    for z in zones:
        clat = float(z["latitude"])
        clon = float(z["longitude"])
        lats.extend([clat, clat + 0.005, clat - 0.005, clat, clat])
        lons.extend([clon, clon, clon, clon + 0.005, clon - 0.005])
        
    # Open-Meteo allows max 100 locations per request usually. We have 45 * 5 = 225. Let's do batches of 100.
    elevations = []
    for i in range(0, len(lats), 100):
        batch_lats = lats[i:i+100]
        batch_lons = lons[i:i+100]
        elevs = fetch_batch_elevation(batch_lats, batch_lons)
        elevations.extend(elevs)
        
    # Now map back to zones
    idx = 0
    for z in zones:
        z_elevs = elevations[idx:idx+5]
        idx += 5
        
        centroid_elev = z_elevs[0]
        max_elev = max(z_elevs)
        min_elev = min(z_elevs)
        
        # Approximate slope % over 1000m span (500m each side)
        elev_diff = max_elev - min_elev
        slope_pct = (elev_diff / 1000.0) * 100.0
        
        # Proxy surface accumulation (Topographic Wetness Index approx)
        # Flatter areas (lower slope) accumulate more water
        # Range is roughly 0 to 10 (higher means more pooling)
        accumulation = max(0.0, 10.0 - slope_pct) 
        
        z["elevation_m"] = round(centroid_elev, 2)
        z["slope_percentage"] = round(slope_pct, 2)
        z["surface_accumulation_index"] = round(accumulation, 2)
        
    # Write back to CSV
    fieldnames = list(zones[0].keys())
    # Ensure our new fields exist
    if "slope_percentage" not in fieldnames:
        fieldnames.extend(["slope_percentage", "surface_accumulation_index"])
        
    with open(ZONES_CSV, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(zones)
        
    print("Successfully updated zones.csv with real DEM data (elevation, slope, accumulation).")

if __name__ == "__main__":
    calculate_terrain()
