# Urban Flood Nowcasting & Risk Mapping System (Prototype)

## Pilot Location: Pune, Maharashtra (Central Wards)

Welcome to the Urban Flood Nowcasting prototype. This repository represents our end-to-end submission for the EDI mid/end-semester project. 
The system is designed to provide localized, sub-ward level flood risk predictions (a "nowcast" for the 0-3 hour timeframe) based on synthetic data representing micro-elevation, municipal drainage capacity, and current rainfall intensity. 

While full-scale smart city deployments rely on expensive real-time sensors, IoT radar integrations, and enterprise SCADA systems, this project successfully proves the core conceptual logic: combining topographical vulnerabilities with live rain data to instantly visualize risk and allow disaster management operators to act quickly.

## Key Features (Phase 7)
- **Dual-Engine Risk Modeling**: Toggle between a physics-inspired rule-based heuristic and a pre-trained Random Forest ML model.
- **Explainable Predictions**: View the specific contributions of elevation, drainage capacity, and rainfall for any given risk score.
- **Interactive React Dashboard**: A polished Vite + React + Tailwind frontend with real-time map updates via Leaflet.
- **Historical Event Replay**: Replay the July 2024 flood event with time-series animations on the map.
- **0-3 Hour Forward Nowcast**: Fetches real Open-Meteo hourly forecast data and displays a forward-looking timeline slider.
- **Flood-Aware Routing**: Calculates the safest path between two zones using NetworkX, penalizing flooded areas.
- **SQLite Database & Background Tasks**: Robust persistence layer with FastAPI background workers simulating a Celery/Redis queue for heavy simulations.
- **Live Open-Meteo Integration**: Fetches real-time precipitation data for Pune.
- **Automated PDF Reports**: Generate and download a snapshot of current city-wide risk levels.

## Team Contributions

This repository is built and maintained collaboratively. Specific modules are owned by the following members:

| Role | Placeholder Name | Responsibility |
|---|---|---|
| Team Lead / Integration | Member A | Overall architecture, integration of modules, final demo assembly |
| Data Engineer | Member B | Dataset sourcing/synthesis, cleaning, elevation + rainfall pipelines |
| ML/Risk Model Owner | Member C | Risk scoring model (rule-based → ML upgrade path), validation |
| Backend Developer | Member D | API layer (FastAPI), data serving, endpoints |
| Frontend/GIS Visualization | Member E | Map dashboard (Leaflet/Folium), risk overlay UI |

*Note to Grader: Individual code ownership is documented within the file headers and inline comments of each respective script.*

## Project Setup & Run Instructions

To replicate this environment locally and run the interactive simulation, follow these steps. 

### Prerequisites
- Python 3.9 or higher installed
- Standard `pip` package manager
- A modern web browser (Chrome, Firefox, Edge, Safari)

### One-Command Quickstart
For evaluating the project easily, we have provided an automated run script that handles virtual environments, dependencies, and server startup:
```bash
# On macOS/Linux:
bash run.sh

# On Windows:
run.bat
```
The script will automatically launch the backend in the background and open the frontend map in your default browser.

---

### Manual Setup Instructions

### 1. Generate the Synthetic Dataset & Time-Series
Because we do not have direct access to live IMD radar feeds or ISRO CartoDEM files for a student project, we synthesize a realistic starting state and a 30-day historical time-series for Pune.
```bash
cd data
python generate_dataset.py
cd ..
```
*This creates the static `zones.csv` and the long-format `zones_timeseries.csv` for ML training.*

### 1b. Train the Machine Learning Model
We include an offline training script that learns from the time-series history:
```bash
cd backend
python train_model.py
cd ..
```
*This saves `risk_model.pkl` to the `models/` directory, fully activating the ML toggle in the frontend.*

### 2. Start the Backend API Server
The backend is a lightweight FastAPI application that computes risk on the fly.
```bash
cd backend
uvicorn main:app --reload
```
*The backend runs on `http://127.0.0.1:8000`.*

### 3. Launch the React Dashboard (Phase 4)
The frontend is a responsive React application built with Vite and Tailwind.
```bash
cd frontend-react
npm run dev
```
*The dashboard will be available at `http://localhost:5173`.*

### 3b. Launch the Legacy Dashboard (Phase 1-3 Fallback)
If you prefer the original vanilla JS prototype without the React build step:
```bash
open frontend/index.html
```

### 4. Running a Simulation
On the left sidebar of the map dashboard, you will see a simulation panel. Enter a sudden rainfall burst amount (e.g., `45` mm) and click **Simulate Rain Burst**. The frontend will `POST` this to the backend, and you will instantly see the map markers recalculate their risk colors. Low-elevation and poor-drainage areas will turn red/severe much faster than higher, well-drained areas.

## Core Deliverables Included
Please refer to the following Markdown files for comprehensive project documentation:
- `PRD.md`: The complete product requirements and domain context.
- `FEASIBILITY_AND_VIABILITY.md`: Analysis of real-world operational viability.
- `IMPACT_AND_BENEFITS.md`: Analysis of localized early warning impact.
- `ARCHITECTURE.md`: System design, technology choices, and component interaction.
- `WORKFLOW.md`: Our weekly timeline and milestones.
- `DATASET.md`: Details regarding our data synthesis approach and production replacements.
- `ASSUMPTIONS.md`: Explicit assumptions made during this prototype build.
- `DEMO_SCRIPT.md`: Guide for the final 5-minute presentation demo.

## Explicit Prototype Limitations (Honesty Declaration)
To maintain academic and engineering integrity, we strictly categorize the capabilities of this prototype:

### 1. Implemented (Actual working functionality)
- **Real-Time Data**: Live Open-Meteo precipitation fetching and 0-3h forecasting for Pune.
- **Real Terrain**: Actual elevation and slope data queried from Open-Meteo's global DEM API for Pune catchment zones.
- **Asynchronous Architecture**: True background task processing (simulating Celery/Redis) with SQLite persistence.
- **Dynamic Routing**: NetworkX-based graph routing that strictly reads from the risk model output to find safe paths.
- **UI / GIS Integration**: Real GeoJSON rendering, React timeline integration, and responsive map controls.

### 2. Simulated / Heuristic (Not physically modeled)
- **The Flood Risk Model**: The current Python engine uses a transparent, physics-*inspired* heuristic (calculating explicit proxy variables for runoff, surface accumulation, and drainage). It is **not** a validated 2D hydrodynamic simulation (like solving Navier-Stokes equations).
- **Drainage Data**: While elevation/slope is real, the municipal drainage capacities are simulated placeholder values.
- **Accuracy**: The ML model's accuracy metrics evaluate its ability to learn the heuristic, not its ability to predict real historical floods against physical ground-truth.

### 3. Planned (Future enterprise scope)
- EPA SWMM (Storm Water Management Model) backend integration.
- Direct ingestion of Pune Municipal Corporation (PMC) actual drainage network GIS layers.
- High-resolution ISRO CartoDEM ingestion (10m/30m resolution instead of API-based centroid sampling).

## Demo Walkthrough
![Demo GIF Placeholder](demo_placeholder.gif)
*(To be replaced with actual recorded screen capture before final submission)*
