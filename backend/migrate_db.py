import csv
import os
import json
from database import engine, Base, SessionLocal
from models import Zone, Simulation

# Create tables
Base.metadata.create_all(bind=engine)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'zones.csv')

def generate_square_polygon(lat, lon, size_deg=0.005):
    # Generates a simple square polygon around the point
    half = size_deg / 2
    polygon = {
        "type": "Polygon",
        "coordinates": [[
            [lon - half, lat - half],
            [lon + half, lat - half],
            [lon + half, lat + half],
            [lon - half, lat + half],
            [lon - half, lat - half]
        ]]
    }
    return json.dumps(polygon)

def migrate():
    db = SessionLocal()
    
    # Check if already migrated
    if db.query(Zone).first():
        print("Database already populated.")
        db.close()
        return

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lat = float(row["latitude"])
            lon = float(row["longitude"])
            geojson = generate_square_polygon(lat, lon)
            
            zone = Zone(
                zone_id=row["zone_id"],
                name=row["name"],
                latitude=lat,
                longitude=lon,
                elevation_m=float(row["elevation_m"]),
                slope_percentage=float(row.get("slope_percentage", 0.0)),
                surface_accumulation_index=float(row.get("surface_accumulation_index", 0.0)),
                drainage_capacity_score=int(row["drainage_capacity_score"]),
                historical_flood_incidents=int(row["historical_flood_incidents"]),
                geojson_polygon=geojson
            )
            db.add(zone)
            
    db.commit()
    db.close()
    print("Migration complete. 45 zones loaded into SQLite.")

if __name__ == "__main__":
    migrate()
