import React from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Hotspot, MapPoint } from '../types';
import L from 'leaflet';
import { Loader2, Map as MapIcon } from 'lucide-react';

// Fix Leaflet marker icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HotspotMapProps {
  hotspots: Hotspot[];
  mapPoints: MapPoint[];
  isLoading?: boolean;
}

export const HotspotMap: React.FC<HotspotMapProps> = ({ hotspots, mapPoints, isLoading = false }) => {
  // Center roughly on Bengaluru
  const bengaluruCenter: [number, number] = [12.9716, 77.5946];

  const getSeverityColor = (severity?: string | null, priorityScore?: number) => {
    let level = severity;

    if (!level) {
      if (typeof priorityScore === "number") {
        if (priorityScore >= 80) level = "critical";
        else if (priorityScore >= 60) level = "high";
        else if (priorityScore >= 40) level = "medium";
        else level = "low";
      } else {
        level = "low";
      }
    }

    switch (String(level).toLowerCase()) {
      case "critical":
        return "#EF4444"; // Red
      case "high":
        return "#F59E0B"; // Orange
      case "medium":
        return "#3B82F6"; // Blue
      default:
        return "#10B981"; // Green
    }
  };

  const isEmpty = (!hotspots || hotspots.length === 0) && (!mapPoints || mapPoints.length === 0);

  return (
    <div className="glass-panel overflow-hidden h-full w-full relative z-0 rounded-xl border border-gray-800 flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 z-[500] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 className="animate-spin text-primary mb-4" size={48} />
          <p className="text-gray-300 font-medium tracking-wide">Loading Map Data...</p>
        </div>
      )}
      
      {!isLoading && isEmpty && (
        <div className="absolute inset-0 z-[500] bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
          <MapIcon className="text-gray-500 mb-4" size={48} />
          <p className="text-gray-400 font-medium tracking-wide">No parking violations detected in this region.</p>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[400] bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-gray-700 pointer-events-none">
        <h3 className="text-white font-semibold mb-2 text-sm">Severity Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-danger"></div> Critical</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning"></div> High</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"></div> Medium</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success"></div> Low</div>
        </div>
      </div>
      
      <MapContainer 
        center={bengaluruCenter} 
        zoom={12} 
        scrollWheelZoom={true} 
        className="h-full w-full bg-[#0a0a0a]"
      >
        {/* Dark theme map tiles (CARTO Dark Matter) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Plot Hotspots (Clusters) */}
        {(hotspots || []).map((hotspot) => {
          const lat = Number(hotspot.latitude);
          const lng = Number(hotspot.longitude);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const calculatedRadius = Math.max(150, (hotspot.violation_count || 0) * 20);
          const opacity = Math.max(0.2, Math.min(0.8, (hotspot.priority_score || 0) / 100));
          const primaryType = hotspot.primary_violation_type || "Unknown violation";
          const junction = hotspot.junction_name || "No junction";
          const station = hotspot.police_station || "Unknown station";
          const score = hotspot.priority_score ?? "N/A";
          const severityText = hotspot.severity || "LOW";

          return (
            <Circle
              key={`hotspot-${hotspot.id}`}
              center={[lat, lng]}
              radius={calculatedRadius}
              pathOptions={{
                color: getSeverityColor(hotspot.severity, hotspot.priority_score),
                fillColor: getSeverityColor(hotspot.severity, hotspot.priority_score),
                fillOpacity: opacity,
                weight: 2
              }}
            >
              <Popup className="dark-popup">
                <div className="text-gray-800 p-1 text-sm space-y-1 min-w-[200px]">
                  <h4 className="font-bold text-base border-b pb-1 mb-2 capitalize">{primaryType.replace('_', ' ')} Hotspot</h4>
                  <p><strong>Location:</strong> {lat.toFixed(5)}, {lng.toFixed(5)}</p>
                  <p><strong>Junction:</strong> {junction}</p>
                  <p><strong>Police Station:</strong> {station}</p>
                  <p><strong>Violations:</strong> {hotspot.violation_count || 0}</p>
                  <p><strong>Priority Score:</strong> <span className="text-danger font-bold">{typeof score === 'number' ? score.toFixed(1) : score}/100</span></p>
                  <p><strong>Severity:</strong> <span className="uppercase text-xs font-bold">{severityText}</span></p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Plot Individual Violations */}
        {(mapPoints || []).slice(0, 500).map((point) => {
          const lat = Number(point.latitude);
          const lng = Number(point.longitude);

          if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

          const violationType = point.violation_type || "Unknown violation";
          const junction = point.junction_name || "No junction";
          const station = point.police_station || "Unknown station";
          
          return (
            <CircleMarker
              key={`point-${point.id}`}
              center={[lat, lng]}
              radius={4} // Small individual dots
              pathOptions={{
                color: '#ffffff',
                fillColor: getSeverityColor(point.severity),
                fillOpacity: 0.9,
                weight: 1
              }}
            >
              <Popup>
                <div className="text-gray-800 p-1 text-sm space-y-1">
                  <h4 className="font-bold border-b pb-1 mb-2 capitalize">{violationType.replace('_', ' ')}</h4>
                  <p><strong>Location:</strong> {lat.toFixed(5)}, {lng.toFixed(5)}</p>
                  <p><strong>Junction:</strong> {junction}</p>
                  <p><strong>Police Station:</strong> {station}</p>
                  {point.timestamp && <p><strong>Time:</strong> {new Date(point.timestamp).toLocaleString()}</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};
