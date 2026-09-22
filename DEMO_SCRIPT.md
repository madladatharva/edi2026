# Demo Script: Urban Flood Nowcasting Prototype (Phase 8 Final)

This script outlines the narrative flow for a 5-minute live demonstration of the final prototype, emphasizing the real-world pipeline, physical proxy models, and dynamic routing capabilities.

## 1. Introduction (0:00 - 1:00)
*   **The Problem:** "Urban flooding isn't a city-wide problem; it's a neighborhood-specific problem driven by topography. Today, we're demonstrating a real-time, micro-ward level flood prediction system for Pune."
*   **The UI:** Point out the MapLibre/Leaflet map. "We've mapped 45 micro-catchments in Pune. The system is currently fetching **live precipitation data from Open-Meteo**, providing a true real-time assessment of current conditions."

## 2. Real Terrain & The Physical Proxy Model (1:00 - 2:00)
*   **Action:** Click on one of the zones to open the **Right Panel**.
*   **Observation:** The panel displays the Risk Score and the explicit Model Breakdown (Rainfall, Elevation, Slope, Surface Accumulation, Drainage).
*   **Narrative:** "This isn't a random guess. We've pulled real DEM (Digital Elevation Model) data for Pune. Look at the breakdown: the model explicitly calculates physical proxies. It measures the slope gradient and the topographic wetness accumulation index. A flat, low-lying area with poor drainage immediately flags as highly susceptible when rainfall begins."

## 3. The 0-3 Hour Nowcast Slider (2:00 - 3:00)
*   **Action:** Go to the bottom timeline slider. Slowly drag it from `Now` to `+1h`, `+2h`, and `+3h`.
*   **Observation:** The map zones dynamically change color as the forecast progresses.
*   **Narrative:** "Emergency responders need to look into the future. Here, we fetch the 3-hour forward forecast. As I move the slider, the backend recalculates the physical risk for every zone based on the incoming storm. You can see the flood risk propagating across the low-lying zones at `+2h`."

## 4. Flood-Aware Evacuation Routing (3:00 - 4:00)
*   **Action:** On the left sidebar, use the **Routing** tool. Select an origin (e.g., a Severe zone) and a safe destination. Click **Find Safe Route**.
*   **Observation:** A blue line draws across the map, navigating *around* the red zones.
*   **Narrative:** "Knowing where the flood is isn't enough; we need to know how to evacuate. We've integrated a NetworkX graph algorithm that treats flooded zones as heavy penalties. It actively routes emergency vehicles around the water."
*   **Action (The 'Wow' Factor):** While the route is active, move the timeline slider to `+2h`.
*   **Observation:** As the flood risk expands at `+2h`, the blue route line dynamically recalculates and jumps to an entirely different set of roads to avoid the *future* flood.
*   **Narrative:** "Because the routing is bound to the physical model, as the storm worsens in hour 2, the evacuation route dynamically updates to avoid streets that *will* be flooded."

## 5. Dual Engine & Final Export (4:00 - 5:00)
*   **Action:** Toggle the **ML Mode** button at the top.
*   **Narrative:** "We support a dual-engine architecture. If the physical heuristic isn't enough, we can flip on a trained Random Forest model that provides a confidence percentage."
*   **Action:** Click the **PDF Report** button at the top right.
*   **Narrative:** "Finally, all of this situational awareness can be instantly exported into a static PDF report for municipal commissioners and disaster management authorities."

---
*Note: Make sure to start the FastAPI backend (`uvicorn main:app`) and React frontend (`npm run dev`) before presenting.*
