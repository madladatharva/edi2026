# Model Card: Flood Risk Random Forest Classifier

## Overview
This model is a `RandomForestClassifier` trained to predict the likelihood of an immediate flooding incident in a localized sub-ward zone based on real-time and rolling rainfall data, combined with topographic and drainage limits.

## Intended Use
- **Primary Use:** To be served via the FastAPI `/zones?model=ml` endpoint as a predictive engine for the Pune Urban Flood Nowcasting dashboard.
- **Out-of-Scope:** This model is NOT intended for life-safety warnings or automated dispatch without human oversight. It is an educational prototype.

## Training Data & Limitations
**WARNING: Synthetic Data Only.** 
This model was trained exclusively on a generated, synthetic dataset (`zones_timeseries.csv`). The data represents 30 days of simulated monsoon bursts over 45 mock zones in Pune. 
- There is no real-world "ground truth" flood labeling in this dataset; the target `flood_incident_flag` was generated via a noisy heuristic function mimicking reality.
- The model successfully learns the patterns inherent in elevation, drainage capacity, and accumulated rainfall, but its exact coefficients do not perfectly map to physical hydrodynamics.

## Performance Metrics (Test Set)
- **Accuracy:** ~93% (varies slightly by seed)
- **F1 Score:** ~88% (class weighting applied to handle flood imbalance)

## Feature Importances
The Random Forest model typically ranks features in the following order of importance (verifiable by running `train_model.py`):
1. **`rainfall_3hr_sum` & `rainfall_6hr_sum`**: High importance. The model correctly identifies that short-term accumulated volume is the primary trigger for flooding.
2. **`elevation_m`**: Medium-high importance. Topographic sinks are inherently more susceptible.
3. **`drainage_capacity_score`**: Medium importance. Validates that poor drainage lowers the threshold required for a flood.
4. **`rainfall_mm` (current 1hr)**: Lower relative importance compared to the accumulated sums.
