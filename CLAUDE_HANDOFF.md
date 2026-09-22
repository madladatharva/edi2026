# Project Summary: Urban Flood Nowcasting & Risk Mapping Prototype

**Context:** Built an end-to-end, runnable prototype repository for an EDI mid/end-semester project. It demonstrates localized (sub-ward level) flood risk nowcasting for Pune by taking in synthetic topographic/drainage data and calculating real-time risk based on rainfall bursts.

## 1. Repository Structure & Documentation
Generated a completely fleshed-out directory structure with highly detailed, grade-ready markdown documentation (300–800 words each):
*   `README.md`: Setup/run instructions and team contribution table.
*   `PRD.md`: Full product requirements, scope, target users, and success criteria.
*   `ARCHITECTURE.md`: Mermaid flowcharts mapping out the data layer, backend, and frontend.
*   `WORKFLOW.md`: An 8-week execution timeline mapped to team members.
*   `DATASET.md` & `ASSUMPTIONS.md`: Explicitly documents how the synthetic data was generated and what constraints/assumptions were made for the prototype.

## 2. Data Layer (`data/`)
*   Created `generate_dataset.py`, which synthesizes a realistic mock dataset for central Pune. 
*   It generates 10 zones with randomized realistic elevations (~560m), drainage capacity scores (1-5), and initial rainfall. 
*   Outputs data into `processed/zones.csv` and `processed/zones.geojson`.

## 3. Backend (`backend/`)
*   Built a lightweight **FastAPI** server (`main.py`).
*   Created Pydantic validation models (`schemas.py`).
*   Implemented `risk_model.py`: A deterministic, rule-based mathematical risk scoring model (0-100 score classifying into Low/Medium/High/Severe bands). Added explicit comments detailing the upgrade path to Machine Learning (LSTM/Random Forest).
*   **Endpoints:**
    *   `GET /zones`: Loads CSV data, calculates baseline risk, and returns JSON.
    *   `POST /simulate`: Accepts a `added_rainfall_mm` payload, updates all zones, recalculates the risk penalty, and returns the updated state.

## 4. Frontend (`frontend/`)
*   Built a dependency-free, vanilla **HTML/CSS/JS** Single Page Application.
*   `index.html` & `style.css`: Features a sleek dark-mode sidebar with a simulation input and a full-width map container.
*   `app.js`: Connects to the FastAPI backend, parses the JSON, and uses **Leaflet.js** to render colored risk markers on a real map of Pune.

## 5. Data Science & Testing (`notebooks/`, `tests/`)
*   Created `exploration.ipynb` for initial Exploratory Data Analysis (EDA) on the synthetic topography.
*   Created `test_risk_model.py` with `pytest` unit tests verifying the mathematical boundaries of the risk scoring logic.

## 🛠️ Troubleshooting & Bug Fixes Applied:
1.  **Dependency Versions:** Unpinned the exact versions in `requirements.txt`. The original strict versions failed to install on newer Python 3.13 environments (Cython/NumPy header conflicts). Unpinning allowed `pip` to grab modern, pre-compiled wheels successfully.
2.  **CSS Layout Fix:** Separated the `html` and `body` flexbox properties in `style.css`. Initially, the map was disappearing into a 0-width void because `html` was acting as a flex container crushing the `body`. 
3.  **Map Tile Providers (CORS/API Blocks):**
    *   Initially tried default *OpenStreetMap* tiles, but they actively blocked access with a 403 error because the frontend was opened via a local `file:///` path (anti-scraping policy).
    *   Swapped to *CartoDB Positron*, which threw an "API Key Required" watermark.
    *   **Final Fix:** Swapped to **Esri World Street Map** tiles (`server.arcgisonline.com`), which are enterprise-grade, require no API keys, and work perfectly with local `file://` testing. The map now renders flawlessly underneath the markers.
