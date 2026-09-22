from pydantic import BaseModel

# Owner: [Placeholder Member D]

class ZoneBase(BaseModel):
    """Base schema for a geographical zone's raw data."""
    zone_id: str
    name: str
    latitude: float
    longitude: float
    elevation_m: float
    drainage_capacity_score: int
    historical_flood_incidents: int
    current_rainfall_mm: float
    geojson_polygon: str | None = None

class ZoneRisk(ZoneBase):
    """Schema for a zone after the risk model has processed it."""
    risk_score: float
    risk_band: str  # Valid values: Low, Medium, High, Severe
    risk_breakdown: dict
    confidence: float | None = None

class SimulationRequest(BaseModel):
    """Payload schema for the simulation endpoint."""
    added_rainfall_mm: float
