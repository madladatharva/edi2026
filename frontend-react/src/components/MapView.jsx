import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polyline, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  
  // Extract lat/lon array from route for Polyline
  const routePositions = route ? route.map(node => [node.lat, node.lon]) : [];

  return (
    <div className="absolute inset-0 z-0">
      <MapContainer center={[18.5204, 73.8567]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <MapResizer />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        
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
