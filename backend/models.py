from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from database import Base
import datetime

class Zone(Base):
    __tablename__ = "zones"

    zone_id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation_m = Column(Float)
    slope_percentage = Column(Float, default=0.0)
    surface_accumulation_index = Column(Float, default=0.0)
    drainage_capacity_score = Column(Integer)
    historical_flood_incidents = Column(Integer)
    geojson_polygon = Column(Text, nullable=True) # Will store JSON string for the polygon

class Simulation(Base):
    __tablename__ = "simulations"
    
    id = Column(String, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="pending") # pending, completed, failed
    model_type = Column(String)
    scenario_type = Column(String) # burst, historical, forecast
    rainfall_amount = Column(Float, nullable=True)
    result_data = Column(Text, nullable=True) # JSON dump of the risk outputs
