# Product Requirements Document (PRD)

## 1. Problem Statement
Urban flooding in Indian cities has become an increasingly severe issue due to rapid, unplanned urbanization and changing climate patterns. Specifically in cities like Pune, sudden extreme rainfall events often overwhelm localized stormwater drainage networks. 
While national and state-level broad forecasts (e.g., "Heavy Rain Expected Tomorrow for Maharashtra") exist, there is a critical lack of sub-ward level "nowcasting" (0-3 hour localized prediction). Disaster response teams need to know exactly *which specific intersections or zones* within a ward will flood first, taking into account micro-elevation and the specific drainage capacity of that local area. This pilot project addresses this gap by focusing on predicting and mapping localized risk for a specific ward in Pune, enabling faster, hyper-local disaster response and resource allocation.

## 2. Objectives
To successfully prove this concept, the prototype must achieve the following measurable objectives:
- **Prediction Speed:** The backend must predict and recalculate a sub-ward zone's risk level within 5 seconds of receiving a new rainfall input payload.
- **Visualization Quality:** The frontend must display risk seamlessly on an interactive GIS web map, mapping specific sub-zones as points with distinct visual risk bands (Low = Green, Medium = Yellow, High = Orange, Severe = Red).
- **Directional Accuracy:** The risk model must achieve directionally sensible risk ranking on our synthetic test cases. For instance, a test case with low elevation, low drainage capacity, and high rainfall *must* mathematically result in a Severe risk band.
- **Extensibility:** Provide a clean, documented upgrade path to swap out the rule-based logic with a Machine Learning model (e.g., LSTM or Random Forest) once real time-series data is acquired.

## 3. Users & Use Case
- **Primary User:** Municipal disaster management cell operators monitoring a specific ward during monsoon season.
- **Secondary User:** Local citizens in the ward seeking hyper-local risk awareness to move vehicles or evacuate ground floors.
- **Primary Use Case:** During a sudden downpour, an operator receives a burst of rainfall data (simulated via our UI). They input it into the system and immediately see which specific intersections will flood first. They can then prioritize dispatching mobile water pumps or issuing localized SMS warnings to those specific high-risk pockets.

## 4. Scope & Out-of-Scope

**In Scope (This EDI Prototype):**
- A synthetic but realistic local dataset representing elevation variance, drainage capacity, and rainfall for a mock Pune ward.
- A functional rule-based risk scoring algorithm evaluating these three core factors.
- A FastAPI backend for data serving, risk calculation, and live simulation endpoints.
- A dependency-light Leaflet.js frontend dashboard visualizing the zones on a real map of Pune.

**Out of Scope (Full Production Vision):**
- Direct API integration with live IMD (Indian Meteorological Department) AWS or Doppler radar feeds.
- Live ingestion of ISRO CartoDEM topographical data.
- Real-time IoT SCADA drainage sensor hardware integration.
- Automated SMS alert dispatch systems (e.g., Twilio integration).
- Scaling the system city-wide across all Pune wards.

## 5. Success Criteria for End-Sem Demo
- A working end-to-end local repository that runs smoothly on a grader's machine without paid API keys.
- Successful execution of the `/simulate` endpoint, showing instant map marker color updates based on user rainfall input.
- Code that is traceably attributed to specific team members.
- Complete, professional documentation covering dataset generation, architecture, and assumptions.

## 6. Literature / Reference Basis
This project's core logic is heavily inspired by existing research in hydrological modeling and urban planning:
- **Rainfall-Runoff Modeling:** We reviewed research into how small urban catchments respond to short-duration, high-intensity rain events. This mirrors standard concepts found in the EPA SWMM (Storm Water Management Model), simplified here for a real-time risk index.
- **DEM-based Flood Mapping:** Background studies demonstrating how micro-topography (Digital Elevation Models) primarily dictates pooling in heavily concretized urban areas. 
- **Urban Drainage Constraints:** Literature defining how municipal stormwater network capacity acts as a strict bottleneck, compounding topographical elevation risks when rain intensity exceeds pipe flow rates.
