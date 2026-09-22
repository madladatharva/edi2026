# Dataset Documentation

## Overview
A critical constraint of this student project is the timeline and the lack of access to paid, enterprise, or strictly government-controlled geospatial APIs. Therefore, this prototype relies on a **synthetic but highly realistic** dataset generated via our custom Python script (`data/generate_dataset.py`). The dataset simulates 10 critical sub-zones located within a central Pune ward (e.g., near Shivajinagar and Deccan).

## Synthesis Methodology
The data generator script creates reproducible output (using a fixed random seed). It scatters geospatial points around central Pune coordinates (approx 18.52°N, 73.85°E) and assigns them baseline attributes that mirror reality:
- Elevations are randomized but constrained tightly around Pune's average altitude (~560 meters above sea level).
- Drainage scores are heavily penalized or rewarded randomly to simulate aging vs. newly built stormwater drains.

## Schema
The generated CSV (`zones.csv`) and GeoJSON files utilize the following schema:
- `zone_id` *(string)*: A unique identifier for the sub-zone (e.g., Z-001).
- `name` *(string)*: A mock local area name matching real Pune localities.
- `latitude` *(float)*: Latitude coordinate.
- `longitude` *(float)*: Longitude coordinate.
- `elevation_m` *(float)*: Base elevation in meters above sea level.
- `drainage_capacity_score` *(int, 1-5)*: A subjective rating. 1 indicates extremely poor drainage (easily blocked), and 5 indicates excellent, high-capacity modern drainage.
- `historical_flood_incidents` *(int)*: A mock integer showing how many times the area flooded in the past 5 years.
- `current_rainfall_mm` *(float)*: The simulated amount of rainfall accumulated in the last hour.

## Production Counterparts
If this EDI project were scaled to a fully funded production startup or government initiative, this synthetic script would be discarded in favor of:
1. **Elevation Data:** High-resolution ISRO Bhuvan CartoDEM (Digital Elevation Model) or local municipal LIDAR surveys for exact street-level topography.
2. **Rainfall Data:** Live API feeds from the IMD (Indian Meteorological Department) Automatic Weather Station (AWS) network and Doppler Radars for minute-by-minute precipitation tracking.
3. **Drainage Capacity:** Direct ingestion of Pune Municipal Corporation (PMC) GIS layers detailing specific stormwater drain pipe diameters and flow capacities.

## Known Limitations
- Because the elevation data is generated via random jittering around a mean, it does not perfectly map to Pune's actual physical micro-topography.
- Drainage scores are arbitrarily assigned. In reality, drainage is a networked graph where downstream blockages affect upstream flow; our prototype treats them as isolated capacity scores.
- The spatial distribution of points is roughly clustered in a bounding box, rather than being bound by precise real-world municipal ward polygons.
