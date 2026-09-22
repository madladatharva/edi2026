import pytest
import sys
import os

# Owner: [Placeholder Member A]
# Ensures the risk model behaves deterministically before integration.

# Add backend directory to python path so we can import risk_model
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
from risk_model import calculate_risk

def test_calculate_risk_severe():
    """
    Test a worst-case scenario:
    - Lowest elevation (545m)
    - Poorest drainage (1)
    - Extreme rainfall (60mm+)
    Result MUST be 'Severe' band.
    """
    res = calculate_risk(elevation_m=545.0, drainage_score=1, rainfall_mm=65.0)
    assert res['band'] == "Severe", f"Expected Severe, got {res['band']}"
    assert res['score'] >= 80.0, f"Expected score >= 80, got {res['score']}"

def test_calculate_risk_low():
    """
    Test a best-case scenario:
    - High elevation (575m)
    - Excellent drainage (5)
    - No rainfall (0mm)
    Result MUST be 'Low' band.
    """
    res = calculate_risk(elevation_m=575.0, drainage_score=5, rainfall_mm=0.0)
    assert res['band'] == "Low", f"Expected Low, got {res['band']}"
    assert res['score'] < 30.0, f"Expected score < 30, got {res['score']}"

def test_calculate_risk_medium():
    """
    Test an average/moderate scenario:
    - Average elevation (560m)
    - Average drainage (3)
    - Moderate rainfall (15mm)
    Result should fall into Low or Medium.
    """
    res = calculate_risk(elevation_m=560.0, drainage_score=3, rainfall_mm=15.0)
    assert res['band'] in ["Low", "Medium"], f"Expected Low/Medium, got {res['band']}"
    
def test_score_cap():
    """
    Ensure the score never exceeds 100, even in catastrophic conditions.
    """
    res = calculate_risk(elevation_m=0.0, drainage_score=1, rainfall_mm=1000.0)
    assert res['score'] <= 100.0, f"Score exceeded 100: {res['score']}"
