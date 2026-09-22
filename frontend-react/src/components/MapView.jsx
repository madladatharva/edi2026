import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Popup, useMap, LayersControl, Marker, FeatureGroup } from 'react-leaflet';
import L from 'leaflet';
import { Camera } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import 'leaflet/dist/leaflet.css';

// Mock Citizen Reports
const citizenReports = [
  { id: 1, lat: 18.5204, lon: 73.8567, image: "https://images.unsplash.com/photo-1547683905-f30e6122d25e?auto=format&fit=crop&w=400&q=80", text: "Severe waterlogging near PMC building. Cars submerged." },
  { id: 2, lat: 18.5362, lon: 73.8739, image: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=400&q=80", text: "Drain overflow on Bund Garden Road." },
  { id: 3, lat: 18.5089, lon: 73.8258, image: "https://images.unsplash.com/photo-1595159048386-b48ff2f5d90e?auto=format&fit=crop&w=400&q=80", text: "Tree down and heavy flooding near Kothrud." }
];

const cameraIconHtml = renderToString(<Camera className="text-white w-5 h-5 p-1 bg-red-600 rounded-full border-2 border-white shadow-lg" />);
const cameraIcon = L.divIcon({
  html: cameraIconHtml,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

const bandColors = {
  Low: '#10b981',    
  Medium: '#fbbf24', 
  High: '#f97316',   
  Severe: '#ef4444'  
};

export default function MapView({ zones, selectedZone, setSelectedZone, highlightedBand, route }) {
  const [radarPath, setRadarPath] = useState(null);

  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past && data.radar.past.length > 0) {
          const latest = data.radar.past[data.radar.past.length - 1];
          setRadarPath(latest.path);
        }
      })
      .catch(err => console.error("Radar fetch failed:", err));
  }, []);

  // Extract lat/lon array from route for Polyline
  const routePositions = route ? route.map(node => [node.lat, node.lon]) : [];

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <MapResizer />
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer name="Dark Street" checked>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
              url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='&copy; Esri'
              url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Topography">
            <TileLayer
              attribution='&copy; OpenTopoMap'
              url='https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
            />
          </LayersControl.BaseLayer>

          {radarPath && (
            <LayersControl.Overlay name="Live Rain Radar" checked>
              <TileLayer
                url={`https://tilecache.rainviewer.com${radarPath}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={0.6}
                zIndex={10}
              />
            </LayersControl.Overlay>
          )}

          <LayersControl.Overlay name="Citizen Reports" checked>
            <FeatureGroup>
              {citizenReports.map(report => (
                <Marker key={report.id} position={[report.lat, report.lon]} icon={cameraIcon}>
                  <Popup>
                    <div className="w-48 text-zinc-900">
                      <img src={report.image} alt="Flood Report" className="w-full h-24 object-cover rounded mb-2" />
                      <p className="text-xs m-0 font-medium">{report.text}</p>
                      <span className="text-[10px] text-zinc-500 mt-1 block">Verified Citizen Report</span>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </FeatureGroup>
          </LayersControl.Overlay>
        </LayersControl>
        
        {/* Render Catchment Polygons */}
        {zones.map((zone) => {
          const isHighlighted = highlightedBand ? zone.risk_band === highlightedBand : true;
          const isSelected = selectedZone?.zone_id === zone.zone_id;
          const geoJsonData = zone.geojson_polygon ? JSON.parse(zone.geojson_polygon) : null;
          
          if (!geoJsonData) return null;

          return (
            <GeoJSON
              key={`${zone.zone_id}-${zone.risk_band}-${isSelected}`}
              data={geoJsonData}
              style={{
                fillColor: bandColors[zone.risk_band] || '#71717a',
                color: isSelected ? '#ffffff' : '#18181b',
                weight: isSelected ? 3 : 1.5,
                fillOpacity: isHighlighted ? 0.6 : 0.1,
                opacity: isHighlighted ? 0.8 : 0.2
              }}
              eventHandlers={{
                click: () => setSelectedZone(zone)
              }}
            >
              <Popup>
                <div className="text-zinc-900 font-sans p-1">
                  <h3 className="font-bold text-sm mb-1">{zone.name}</h3>
                  <p className="m-0 text-xs">Risk: <strong style={{ color: bandColors[zone.risk_band] }}>{zone.risk_band}</strong></p>
                </div>
              </Popup>
            </GeoJSON>
          );
        })}

        {/* Render Flood-Aware Route if present */}
        {routePositions.length > 0 && (
          <Polyline 
            positions={routePositions} 
            pathOptions={{ color: '#60a5fa', weight: 5, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>

      <div className="absolute bottom-6 left-6 bg-zinc-900/90 backdrop-blur border border-zinc-800 p-4 rounded-xl z-[400] shadow-xl pointer-events-none">
        <h4 className="text-xs text-zinc-400 uppercase font-bold mb-3 tracking-wider">Risk Legend</h4>
        {Object.entries(bandColors).map(([band, color]) => (
          <div key={band} className="flex items-center mb-2 text-sm text-zinc-200 font-medium">
            <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: color }}></span>
            {band} Risk
          </div>
        ))}
      </div>
    </div>
  );
}
