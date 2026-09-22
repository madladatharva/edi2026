from fastapi import FastAPI, HTTPException, Query, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import csv
import json
import uuid
import datetime
import time

from schemas import ZoneRisk, SimulationRequest
from risk_model import calculate_risk
from live_weather import get_current_rainfall_pune, get_forecast_rainfall_pune
from database import get_db, engine, Base
from models import Zone, Simulation
from routing import find_flood_aware_route
from collections import defaultdict
from fastapi.responses import FileResponse
import tempfile
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

# Owner: [Placeholder Member D]

app = FastAPI(
    title="Urban Flood Nowcasting API",
    description="Backend API serving Dual-Mode Risk Predictions with SQLite & Async Sims.",
    version="3.0.0" # Upgraded for Phase 7
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TS_DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'processed', 'zones_timeseries.csv')

def _build_zone_risk(z: Zone, rainfall: float, use_ml: bool) -> dict:
    risk = calculate_risk(z.elevation_m, z.slope_percentage, z.surface_accumulation_index, z.drainage_capacity_score, rainfall, use_ml)
    return {
        "zone_id": z.zone_id,
        "name": z.name,
        "latitude": z.latitude,
        "longitude": z.longitude,
        "elevation_m": z.elevation_m,
        "drainage_capacity_score": z.drainage_capacity_score,
        "historical_flood_incidents": z.historical_flood_incidents,
        "current_rainfall_mm": round(rainfall, 2),
        "geojson_polygon": z.geojson_polygon,
        "risk_score": risk["score"],
        "risk_band": risk["band"],
        "risk_breakdown": risk["breakdown"],
        "confidence": risk.get("confidence")
    }

@app.get("/zones", response_model=List[ZoneRisk])
def get_all_zones(model: str = Query("rule_based"), db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    use_ml = (model == "ml")
    result = [_build_zone_risk(z, 0.0, use_ml) for z in zones]
    return result

@app.get("/zones/{zone_id}", response_model=ZoneRisk)
def get_zone(zone_id: str, model: str = Query("rule_based"), db: Session = Depends(get_db)):
    z = db.query(Zone).filter(Zone.zone_id == zone_id).first()
    if not z:
        raise HTTPException(status_code=404, detail=f"Zone {zone_id} not found")
    
    use_ml = (model == "ml")
    return _build_zone_risk(z, 0.0, use_ml)

# Background task for heavy simulations
def run_simulation(sim_id: str, added_rainfall_mm: float, model: str):
    # This simulates a background worker process (Celery alternative)
    db = next(get_db())
    try:
        zones = db.query(Zone).all()
        use_ml = (model == "ml")
        
        # Simulate processing time
        time.sleep(1)
        
        result = [_build_zone_risk(z, added_rainfall_mm, use_ml) for z in zones]
        
        sim = db.query(Simulation).filter(Simulation.id == sim_id).first()
        if sim:
            sim.status = "completed"
            sim.result_data = json.dumps(result)
            db.commit()
    except Exception as e:
        db.rollback()
        sim = db.query(Simulation).filter(Simulation.id == sim_id).first()
        if sim:
            sim.status = "failed"
            sim.result_data = str(e)
            db.commit()
    finally:
        db.close()

@app.post("/simulations")
def create_simulation(sim_req: SimulationRequest, background_tasks: BackgroundTasks, model: str = Query("rule_based"), db: Session = Depends(get_db)):
    sim_id = str(uuid.uuid4())
    sim = Simulation(
        id=sim_id,
        status="pending",
        model_type=model,
        scenario_type="burst",
        rainfall_amount=sim_req.added_rainfall_mm
    )
    db.add(sim)
    db.commit()
    
    background_tasks.add_task(run_simulation, sim_id, sim_req.added_rainfall_mm, model)
    return {"sim_id": sim_id, "status": "pending", "message": "Simulation started in background."}

@app.get("/simulations/{sim_id}")
def get_simulation(sim_id: str, db: Session = Depends(get_db)):
    sim = db.query(Simulation).filter(Simulation.id == sim_id).first()
    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    if sim.status == "completed" and sim.result_data:
        return {"sim_id": sim.id, "status": sim.status, "zones": json.loads(sim.result_data)}
    return {"sim_id": sim.id, "status": sim.status}

# Fallback sync /simulate for immediate UI response (bridges old logic)
@app.post("/simulate", response_model=List[ZoneRisk])
def simulate_rainfall_sync(sim: SimulationRequest, model: str = Query("rule_based"), db: Session = Depends(get_db)):
    zones = db.query(Zone).all()
    use_ml = (model == "ml")
    result = [_build_zone_risk(z, sim.added_rainfall_mm, use_ml) for z in zones]
    return result

@app.get("/live", response_model=List[ZoneRisk])
def fetch_live_weather(model: str = Query("rule_based"), db: Session = Depends(get_db)):
    live_rain = get_current_rainfall_pune()
    if live_rain < 0:
        raise HTTPException(status_code=502, detail="Failed to fetch live weather data from Open-Meteo.")
    
    zones = db.query(Zone).all()
    use_ml = (model == "ml")
    result = [_build_zone_risk(z, live_rain, use_ml) for z in zones]
    return result

@app.get("/nowcast")
def fetch_nowcast_timeline(model: str = Query("rule_based"), db: Session = Depends(get_db)):
    forecast_rain = get_forecast_rainfall_pune() # [now, +1h, +2h, +3h]
    zones = db.query(Zone).all()
    use_ml = (model == "ml")
    
    timeline = []
    for i, rain in enumerate(forecast_rain):
        frame_zones = [_build_zone_risk(z, rain, use_ml) for z in zones]
        timeline.append({
            "offset_hours": i,
            "timestamp": f"+{i}h",
            "zones": frame_zones
        })
        
    return timeline

@app.get("/route")
def get_flood_aware_route(origin_id: str, dest_id: str, offset_hours: int = 0, model: str = Query("rule_based"), db: Session = Depends(get_db)):
    # Fetch predicted rainfall for the requested hour
    forecast_rain = get_forecast_rainfall_pune()
    target_rain = forecast_rain[min(offset_hours, 3)] if forecast_rain else 0.0
    
    # Calculate predicted risk for all zones to apply penalties
    zones = db.query(Zone).all()
    use_ml = (model == "ml")
    zones_with_risk = [_build_zone_risk(z, target_rain, use_ml) for z in zones]
    
    return find_flood_aware_route(zones_with_risk, origin_id, dest_id)

@app.get("/replay")
def get_replay_data(model: str = Query("rule_based"), db: Session = Depends(get_db)):
    if not os.path.exists(TS_DATA_PATH):
        raise HTTPException(status_code=500, detail="Time-series data not found.")
    
    use_ml = (model == "ml")
    base_zones = db.query(Zone).all()
    zones_lookup = {z.zone_id: z for z in base_zones}
    
    frames = defaultdict(list)
    with open(TS_DATA_PATH, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            ts = row["timestamp"]
            hour = int(ts[11:13])
            if hour % 6 != 0:
                continue
                
            risk = calculate_risk(float(row["elevation_m"]), int(row["drainage_capacity_score"]), float(row["rainfall_mm"]), use_ml)
            
            z = zones_lookup[row["zone_id"]]
            frames[ts].append({
                "zone_id": z.zone_id,
                "name": z.name,
                "latitude": z.latitude,
                "longitude": z.longitude,
                "elevation_m": z.elevation_m,
                "drainage_capacity_score": z.drainage_capacity_score,
                "current_rainfall_mm": float(row["rainfall_mm"]),
                "geojson_polygon": z.geojson_polygon,
                "risk_score": risk["score"],
                "risk_band": risk["band"],
                "risk_breakdown": risk["breakdown"],
                "confidence": risk.get("confidence")
            })
            
    sorted_frames = [{"timestamp": k, "zones": v} for k, v in sorted(frames.items())]
    return sorted_frames

@app.get("/report")
def generate_pdf_report(model: str = Query("rule_based"), db: Session = Depends(get_db)):
    zones = get_all_zones(model=model, db=db)
    
    summary = {"Low": 0, "Medium": 0, "High": 0, "Severe": 0}
    for z in zones:
        summary[z["risk_band"]] += 1
        
    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    c = canvas.Canvas(path, pagesize=letter)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, 750, "Urban Flood Nowcasting - City-Wide Risk Report")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, 720, f"Engine Used: {model.upper()}")
    c.drawString(50, 700, f"Summary Stats: Low({summary['Low']}) | Medium({summary['Medium']}) | High({summary['High']}) | Severe({summary['Severe']})")
    
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, 660, "Zone ID")
    c.drawString(150, 660, "Name")
    c.drawString(350, 660, "Rainfall (mm)")
    c.drawString(450, 660, "Risk Band")
    
    c.setFont("Helvetica", 10)
    y = 640
    for z in zones:
        if y < 50:
            c.showPage()
            c.setFont("Helvetica", 10)
            y = 750
        c.drawString(50, y, z["zone_id"])
        c.drawString(150, y, z["name"][:30])
        c.drawString(350, y, str(z["current_rainfall_mm"]))
        c.drawString(450, y, z["risk_band"])
        y -= 20
        
    c.save()
    
    return FileResponse(path, media_type='application/pdf', filename='flood_risk_report.pdf')
