import os
import joblib
import warnings

# Attempt to safely load the trained ML model gracefully at boot
ml_model = None
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'risk_model.pkl')
if os.path.exists(MODEL_PATH):
    try:
        # Ignore trivial scikit-learn version warnings for the prototype
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            ml_model = joblib.load(MODEL_PATH)
    except Exception as e:
        print(f"Failed to load ML model: {e}")

def calculate_risk(elevation_m: float, slope_pct: float, surface_acc: float, drainage_score: int, rainfall_mm: float, use_ml: bool = False) -> dict:
    """
    Calculates explicit flood risk based on physical proxies.
    Returns explicit breakdown of Rainfall, Elevation, Slope, Surface Accumulation, and Drainage.
    """
    
    # --- Machine Learning Path ---
    if use_ml and ml_model is not None:
        try:
            r_3hr = rainfall_mm * 2
            r_6hr = rainfall_mm * 3
            prob = ml_model.predict_proba([[rainfall_mm, r_3hr, r_6hr, elevation_m, drainage_score]])[0][1]
            total_score = prob * 100.0
            
            if total_score < 30:
                band = "Low"
            elif total_score < 60:
                band = "Medium"
            elif total_score < 80:
                band = "High"
            else:
                band = "Severe"
                
            return {
                "score": round(total_score, 2),
                "band": band,
                "confidence": round(max(prob, 1 - prob) * 100, 2),
                "breakdown": {
                    "Rainfall": f"{round(rainfall_mm, 2)} mm",
                    "Elevation": f"{round(elevation_m, 2)} m",
                    "Slope": f"{round(slope_pct, 2)}%",
                    "Surface Accumulation": f"{round(surface_acc, 2)} / 10",
                    "Drainage Capacity": f"{drainage_score} / 5",
                    "ML_Probability": f"{round(prob * 100, 2)}%"
                }
            }
        except Exception as e:
            print(f"ML prediction failed: {e}. Falling back to rule-based logic.")
            
    # --- Rule-Based Deterministic Engine ---
    
    # 1. Runoff Generation (Rainfall)
    # Rainfall caps around 60mm for max heuristic impact.
    rain_score = min(rainfall_mm, 60.0) / 60.0 * 100 
    
    # 2. Terrain Susceptibility (Slope & Accumulation)
    # Low slope and high accumulation drastically increase pooling risk.
    # Accumulation is out of 10. Max pooling risk = 100.
    terrain_susceptibility = (surface_acc / 10.0) * 100
    
    # 3. Drainage Offset (Capacity)
    # High capacity reduces the final score. (1 is bad, 5 is excellent).
    drainage_reduction = (drainage_score / 5.0) * 50 # Removes up to 50 points of risk
    
    # Final Formula: Risk is heavily dependent on Rain. If rain > 0, terrain acts as a multiplier.
    if rainfall_mm > 2.0:
        # Base risk from rain, magnified by terrain, mitigated by drainage
        total_score = rain_score + (terrain_susceptibility * 0.4) - drainage_reduction
    else:
        # Minimal risk if barely any rain, regardless of terrain
        total_score = max(0, rainfall_mm * 2)
        
    total_score = max(0, min(100.0, total_score))
    
    if total_score < 25:
        band = "Low"
    elif total_score < 50:
        band = "Medium"
    elif total_score < 75:
        band = "High"
    else:
        band = "Severe"
        
    # Translate values to categorical strings for UI Explainability
    rain_cat = "Low" if rainfall_mm < 10 else "Medium" if rainfall_mm < 30 else "High"
    acc_cat = "Low" if surface_acc < 4 else "Medium" if surface_acc < 7 else "High"
    
    return {
        "score": round(total_score, 2),
        "band": band,
        "breakdown": {
            "Rainfall": f"{round(rainfall_mm, 2)} mm ({rain_cat})",
            "Elevation": f"{round(elevation_m, 2)} m",
            "Slope": f"{round(slope_pct, 2)}%",
            "Surface Accumulation": f"{round(surface_acc, 2)}/10 ({acc_cat})",
            "Drainage Capacity": f"{drainage_score}/5"
        }
    }
