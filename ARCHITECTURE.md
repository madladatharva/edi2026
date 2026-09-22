# System Architecture

## Architecture Diagram

The following Mermaid flowchart illustrates the flow of data from generation/ingestion through the backend processing layer, and finally to the user-facing web dashboard.

```mermaid
flowchart TD
    subgraph Data Layer [Data Layer - Mocked for Prototype]
        A[Synthetic Dataset Generator] -->|Outputs CSV/GeoJSON| B(Processed Data Store)
    end
    
    subgraph Backend Services [Backend Services - FastAPI]
        B --> C[FastAPI Application]
        C --> D[Rule-Based Model (Fallback)]
        C --> M[Trained ML Model (Random Forest)]
        D -->|Calculates Risk| C
        M -->|Predicts Risk| C
    end
    
    subgraph Frontend Client [Frontend Client - Vanilla JS]
        E[Leaflet Map Dashboard] -->|GET /zones| C
        E -->|POST /simulate| C
        C -->|Returns JSON Risk Array| E
    end
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style C fill:#bbf,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
```

## Layer Descriptions & Technology Choices

### 1. Data Layer (Synthetic for Prototype)
**Tech Choice:** Python (`csv`, `json`, `random`)
Because this is an educational prototype built within a restricted timeline, we cannot rely on live, enterprise-grade geospatial APIs which often require paid access or extensive authorization. Instead, we use a local Python script (`generate_dataset.py`) to synthesize a realistic dataset containing elevation, drainage capacity, and baseline rainfall for a simulated ward in Pune. 
**Production Counterpart:** In a real-world deployed system, this entire layer would be replaced by scheduled cron jobs fetching live IMD radar data and querying ISRO Bhuvan for highly accurate elevation tiles.

### 2. Backend API
**Tech Choice:** FastAPI (Python), Uvicorn
We chose FastAPI because it is extremely lightweight, incredibly fast (comparable to NodeJS/Go), and provides out-of-the-box OpenAPI (Swagger) documentation. It serves the current state of the zones and handles dynamic simulation requests. By keeping it stateless for the prototype, we eliminate the need for a complex database setup (like PostgreSQL/PostGIS) for graders to configure. The data is read directly from the generated CSV file.

### 3. Risk Scoring Model
**Tech Choice:** Python (Rule-based arithmetic)
Currently implemented as a rule-based weighted formula inside `risk_model.py`. It calculates a dynamic penalty factoring in elevation relative to neighbors, fixed drainage capacity, and variable rainfall intensity. This deterministic approach is highly explainable, which is ideal for a prototype. 
**Production Counterpart:** This layer acts as a stand-in for a future trained machine learning model (e.g., Random Forest Regressor or an LSTM). Once time-series data of actual flooding events is recorded over several monsoons, this script can be easily swapped out for an `sklearn` or `tensorflow` inference pipeline.

### 4. Frontend GIS Visualization
**Tech Choice:** Vanilla JavaScript, HTML, CSS, Leaflet.js
To visualize the geospatial risk, we built a single-page application using Leaflet.js for mapping. This allows us to dynamically overlay risk data on a real map of Pune. We intentionally avoided complex build frameworks like React or Webpack. By sticking to CDN-hosted Leaflet and vanilla JS, the frontend runs simply by opening `index.html` in any browser, ensuring it is easily buildable and runnable for anyone evaluating the student project.
