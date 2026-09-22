# Feasibility and Viability Analysis

This document provides a realistic evaluation of deploying the Urban Flood Nowcasting system in a real municipal environment, such as the Pune Municipal Corporation (PMC). While the current prototype demonstrates the technical mechanism of localized early warning, an operational deployment requires overcoming significant data, licensing, and integration hurdles.

## Technical Feasibility
The core technical architecture—a decoupled FASTAPI backend, a React-based spatial frontend, and a dual-engine risk modeling approach—is **highly feasible** for production. The stack is lightweight and horizontally scalable.
However, several technical gaps remain between this prototype and a production-ready system:
* **Current State:** The prototype uses an arbitrary 45-zone grid and synthetic elevation/drainage metrics. 
* **Production Requirement:** An operational system must integrate with actual municipal GIS layers. It requires high-resolution Digital Elevation Models (DEMs) (e.g., from ISRO's Bhuvan or drone LiDAR surveys) and mapped stormwater drainage networks (capacity, diameter, blockages) maintained by the local ward offices.

## Data Feasibility and Limitations
The current machine learning model achieves over 96% accuracy, but **this is heavily caveated by the use of synthetic data.**
* **The Synthetic Advantage:** Synthetic data is structurally clean and perfectly aligns with the target variables because it was generated programmatically. It lacks the noise, sensor failures, and irregular edge cases found in the real world.
* **Procuring Real Data:** Training a production model requires at least 5–10 years of historical, geo-tagged flood incident logs from the PMC Disaster Management Cell, paired against high-frequency historical rainfall data from the Indian Meteorological Department (IMD) or local sensor networks like Pune SAFAR. 
* Real-world accuracy will inevitably be lower than prototype metrics due to unmapped localized blockages, dynamic solid waste dumping in drains, and incomplete historical reporting.

## Operational Viability
The long-term viability of this project is dictated by institutional alignment rather than cloud infrastructure costs.
* **Operating Costs:** The cloud computing costs to run this system for a city the size of Pune are trivial (under $500/month). 
* **Institutional Bottlenecks:** The primary barrier to operational adoption is data licensing and inter-agency data sharing. The IMD controls authoritative real-time radar and rainfall data, while the PMC controls drainage maps and emergency response. An active Memorandum of Understanding (MoU) between these agencies is a hard prerequisite for viability. 
* **Target Operator:** This system is not designed to be run by the general public. It should be operated by the PMC Disaster Management Control Room to orchestrate deployment of emergency personnel and water pumps.

## Risks and Reliability
Deploying an early warning system carries significant operational risks:
* **Cost of False Positives:** Alert fatigue. If the system frequently warns of Severe floods that never materialize, municipal operators and citizens will stop paying attention, rendering the tool useless.
* **Cost of False Negatives:** If the system predicts "Low Risk" but catastrophic flooding occurs, the failure can lead to loss of property and life, coupled with severe institutional liability.
* **Mitigation:** Before any operational deployment, the system must undergo an extensive "shadow mode" phase—running live during a monsoon season without triggering actual public alerts—to validate the model's accuracy against real flood outcomes.
