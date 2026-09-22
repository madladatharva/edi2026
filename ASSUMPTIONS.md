# Project Assumptions

While designing and building this prototype, several key assumptions were made. Documenting these is critical to ensure graders and reviewers understand that we have deliberately scoped the project appropriately for a student timeline, rather than simply omitting complex real-world variables.

## 1. Synthetic Data Validity
**Assumption:** We assume that our synthetically generated dataset (particularly the variance in elevation and drainage capacity) directionally represents the real-world variance found in a typical Pune ward.
**Rationale:** Without access to high-res DEMs, we must rely on our algorithm behaving correctly relative to the *differences* in the mock data. If the model works on our realistic mock data, the logic will hold when connected to real data.

## 2. Rainfall Uniformity
**Assumption:** For the sake of the `/simulate` endpoint demonstration, we assume the simulated rainfall spike applies uniformly across all zones in the selected ward simultaneously.
**Rationale:** In extreme micro-weather, one side of a ward might receive 50mm of rain while another receives 20mm. Managing a complex, spatially interpolating rainfall grid is out of scope for this UI prototype.

## 3. Abstraction of Drainage Networks
**Assumption:** Real urban drainage relies on complex hydrodynamic networks (pipe diameters, silt blockages, outfall levels into rivers). We assume this vast complexity can be abstracted into a simple `drainage_capacity_score` (1-5) for initial risk calculation.
**Rationale:** Implementing a full hydrodynamic flow simulation (like EPA SWMM) requires months of calibration. A simple scalar score proves the conceptual integration of drainage into the risk equation.

## 4. Elevation Relativity
**Assumption:** Flood risk is highly dependent on neighboring elevation (water flows downhill). Our rule-based model assumes that a lower absolute elevation in our localized cluster strongly correlates with a higher risk of becoming a "sink".
**Rationale:** Without a continuous topography surface, we treat our discrete zone points as isolated sinks to demonstrate the penalty of low ground.

## 5. Real-time Ingestion Latency
**Assumption:** We assume that if connected to live IMD radar data, the API ingest delay would be negligible (<1 minute) for nowcasting purposes.
**Rationale:** The value of a "nowcast" relies on immediacy. We assume our fast backend is sufficient, provided the external data provider has low latency.

## 6. Stateless Architecture
**Assumption:** The prototype backend is fundamentally stateless, calculating risk on the fly per request. We assume historical time-series storage is unnecessary for the immediate scope of the pilot demo.
**Rationale:** Setting up relational databases (PostgreSQL/PostGIS) creates a heavy local setup burden. Reading state from a CSV and updating in-memory demonstrates the feature perfectly for an EDI review.
