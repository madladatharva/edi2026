// Owner: [Placeholder Member E]

const API_BASE = "http://127.0.0.1:8000";
let map;
let markers = [];

/**
 * Initializes the Leaflet map centered on Pune.
 */
function initMap() {
    map = L.map('map').setView([18.5204, 73.8567], 13);

    // Load Esri World Street Map tiles
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    fetchZones();
}

function getMarkerColor(band) {
    switch(band) {
        case 'Low': return '#2ecc71';      
        case 'Medium': return '#f1c40f';   
        case 'High': return '#e67e22';     
        case 'Severe': return '#e74c3c';   
        default: return '#7f8c8d';         
    }
}

function renderMarkers(zones) {
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    zones.forEach(zone => {
        const color = getMarkerColor(zone.risk_band);
        
        const marker = L.circleMarker([zone.latitude, zone.longitude], {
            radius: 12,
            fillColor: color,
            color: '#000',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.85
        }).addTo(map);

        const popupContent = `
            <div style="font-family: sans-serif; font-size: 14px;">
                <h4 style="margin:0 0 8px 0; color: #2c3e50;">${zone.name}</h4>
                <b>ID:</b> ${zone.zone_id}<br>
                <b>Risk Level:</b> <span style="color:${color}; font-weight:bold;">${zone.risk_band}</span><br>
                <b>Rainfall (1h):</b> ${zone.current_rainfall_mm} mm<br>
                <small>Click marker for detailed breakdown.</small>
            </div>
        `;
        
        marker.bindPopup(popupContent);

        marker.on('click', () => {
            document.getElementById('zone-detail').classList.remove('hidden');
            document.getElementById('detail-name').innerText = `${zone.name} (${zone.zone_id})`;
            
            const bandSpan = document.getElementById('detail-band');
            bandSpan.innerText = zone.risk_band;
            bandSpan.style.color = color;
            bandSpan.style.fontWeight = 'bold';
            
            document.getElementById('detail-score').innerText = zone.risk_score;
            
            // Calculate percentages based on max contribution points
            const rainPct = (zone.risk_breakdown.rainfall_contribution / 50) * 100;
            const elevPct = (zone.risk_breakdown.elevation_contribution / 30) * 100;
            const drainPct = (zone.risk_breakdown.drainage_contribution / 20) * 100;
            
            document.getElementById('bar-rain').style.width = `${Math.min(rainPct, 100)}%`;
            document.getElementById('bar-elev').style.width = `${Math.min(elevPct, 100)}%`;
            document.getElementById('bar-drain').style.width = `${Math.min(drainPct, 100)}%`;
        });

        markers.push(marker);
    });
}

async function fetchZones() {
    const modelType = document.getElementById('model-select').value;
    try {
        const response = await fetch(`${API_BASE}/zones?model=${modelType}`);
        if (!response.ok) throw new Error("Backend not reachable or data missing.");
        const zones = await response.json();
        renderMarkers(zones);
    } catch (error) {
        console.error("Error fetching zones:", error);
    }
}

// Re-fetch zones when the model toggle changes
document.getElementById('model-select').addEventListener('change', fetchZones);

document.getElementById('simulate-btn').addEventListener('click', async () => {
    const inputField = document.getElementById('rain-input');
    const addedRain = parseFloat(inputField.value);
    
    if (isNaN(addedRain) || addedRain <= 0) {
        alert("Please enter a valid positive number for rainfall.");
        return;
    }

    const modelType = document.getElementById('model-select').value;
    
    try {
        const btn = document.getElementById('simulate-btn');
        btn.innerText = "Processing...";

        const response = await fetch(`${API_BASE}/simulate?model=${modelType}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ added_rainfall_mm: addedRain })
        });
        
        if (!response.ok) throw new Error("Simulation request failed.");
        const zones = await response.json();
        renderMarkers(zones);
        
        btn.innerText = "Simulate Rain Burst";
        inputField.value = "";
    } catch (error) {
        console.error("Error simulating rainfall:", error);
        alert("Failed to run simulation. Check backend logs.");
        document.getElementById('simulate-btn').innerText = "Simulate Rain Burst";
    }
});

// Live Weather Hook
document.getElementById('live-btn').addEventListener('click', async () => {
    const modelType = document.getElementById('model-select').value;
    
    try {
        const btn = document.getElementById('live-btn');
        btn.innerText = "Fetching...";

        const response = await fetch(`${API_BASE}/live?model=${modelType}`);
        if (!response.ok) throw new Error("Live weather request failed.");
        
        const zones = await response.json();
        renderMarkers(zones);
        
        btn.innerText = "Fetch Live Weather (Pune)";
    } catch (error) {
        console.error("Error fetching live weather:", error);
        alert("Failed to fetch live weather data.");
        document.getElementById('live-btn').innerText = "Fetch Live Weather (Pune)";
    }
});

window.onload = initMap;
