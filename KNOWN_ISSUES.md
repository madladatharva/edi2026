# Known Issues & Engineering Log

This document serves as an engineering log of the technical hurdles encountered during Phase 1 of development and how they were resolved. It demonstrates the real-world debugging process of assembling the prototype.

## 1. Dependency Conflicts on Modern Python Versions
*   **Problem:** The initial execution of `pip install -r requirements.txt` failed with a Cython compiler error related to NumPy headers.
*   **Root Cause:** The `requirements.txt` file had strictly pinned, older versions of libraries (e.g., `pandas==2.1.0`). The local development environment was running Python 3.13. Older versions of Pandas do not have pre-compiled binary wheels for Python 3.13, forcing `pip` to build from source, which failed due to deprecated Cython C-APIs in the older NumPy dependencies.
*   **Fix:** We removed the strict version pinning in `requirements.txt`. By allowing `pip` to resolve the latest compatible versions (which have modern, pre-compiled wheels for Python 3.13), the installation succeeded instantly without needing to compile C extensions locally.

## 2. CSS Flexbox Layout Crushing Map Render
*   **Problem:** The frontend Leaflet map was completely invisible (displaying as a blank white space), even though the backend was serving data correctly and the Leaflet JS was initializing without console errors.
*   **Root Cause:** In `style.css`, both the `html` and `body` tags were set to `display: flex`. Because the `html` tag was acting as a flex container, and the `body` lacked a `width: 100%` property, the `body` shrank to only fit its rigid content (the 320px sidebar). The `#map` `div`, despite having `flex-grow: 1`, had no remaining space in the `body` to grow into.
*   **Fix:** Separated the CSS rules. We applied `width: 100%; height: 100%;` to `html`, and set `body` as the sole flex container with 100% width. This allowed the `#map` to correctly expand and fill the right side of the screen.

## 3. Map Tile Provider Blocking Local Access (CORS/Anti-Scraping)
*   **Problem:** The map markers rendered on a gray background covered in error tiles stating: "Access blocked: App is not following the tile usage policy".
*   **Root Cause:** The default OpenStreetMap (OSM) tile servers have implemented aggressive anti-scraping policies. When `index.html` is opened directly via the local `file:///` protocol, the browser sends a `null` or missing HTTP Referrer. OSM servers detect this and block the tile requests. A subsequent attempt with CartoDB Positron tiles resulted in an "API Key Required" watermark due to recent policy changes at Carto.
*   **Fix:** Swapped the Leaflet tile layer URL to point to **Esri World Street Map** (`server.arcgisonline.com`). Esri provides high-quality, enterprise-grade basemaps that are freely accessible without an API key and do not aggressively block local `file://` testing origins.
