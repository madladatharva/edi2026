# Project Workflow & Milestones

This document outlines our team's week-by-week execution plan from project inception until the end-semester submission (an 8-week timeline). This ensures all deliverables in the PRD are met methodically.

## Phase 1: Foundation & Data (Weeks 1-2)
**Goal:** Finalize product requirements, establish the software architecture, and create a running skeleton of the data pipeline. This phase represents the "40-50% completion" mark targeted for mid-semester reviews.
- **Member A (Lead):** Draft and finalize the `PRD.md`, `ARCHITECTURE.md`, and initialize the Git repository.
- **Member B (Data):** Research Pune's topography and write `generate_dataset.py` to create the synthetic local ward dataset. Ensure outputs are in valid CSV and GeoJSON formats.
- **Member D (Backend):** Set up the basic FastAPI backend structure, handle CORS, and implement dummy endpoints returning hardcoded data.

## Phase 2: Core Logic & ML Preparation (Weeks 3-5)
**Goal:** Implement the mathematical risk model and wire it securely to the backend endpoints.
- **Member C (ML/Risk):** Develop the rule-based risk scoring logic (`risk_model.py`) and balance the weights. **[COMPLETED: Phase 3 ML Upgrade — Designed synthetic time-series, trained a RandomForestClassifier (`train_model.py`), generated `MODEL_CARD.md`, and served it alongside the rule-based fallback.]**
- **Member B (Data):** Perform Exploratory Data Analysis (EDA) on the synthetic data in `exploration.ipynb` to validate the statistical distribution of our mock data.
- **Member D (Backend):** Implement the actual `GET /zones` and `POST /simulate` endpoints, connecting them directly to Member C's risk model.
- **Member A (Lead):** Write automated unit tests (`test_risk_model.py`) to guarantee the backend logic does not break during integration.

## Phase 3: Frontend Visualization & Integration (Weeks 6-7)
**Goal:** Build the interactive map dashboard and integrate it seamlessly with the API.
- **Member E (Frontend):** Build the `index.html`, `style.css`, and `app.js` files. Integrate Leaflet.js and render the map markers over Pune using the initial API payload.
- **Member E (Frontend):** Implement the interactive sidebar UI to allow users to input simulated rainfall.
- **Member A & D:** Assist with backend-frontend integration, troubleshoot any CORS issues, and finalize the JSON payload structures for maximum efficiency.

## Phase 4: Polish, Testing & Delivery (Week 8)
**Goal:** Final system testing, documentation polish, and presentation preparation.
- **All Members:** Conduct end-to-end bug bash testing on the entire prototype. **[COMPLETED: Phase 6 Final Polish — React Frontend rewritten, Replay/PDF Export/Bilingual UI added, Feasibility/Impact docs authored.]**
- **Member C:** Finalize `ASSUMPTIONS.md` to ensure graders understand the constraints of our logic.
- **Member A:** Record the final demo GIF, polish the `README.md` quickstart guide, and coordinate the team's final presentation rehearsal.
