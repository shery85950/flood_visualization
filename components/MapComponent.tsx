import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { StationLocation } from '../types';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
// We cannot import images directly in this environment, so we use CDN URLs.
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  stations: StationLocation[];
  onStationSelect: (station: StationLocation) => void;
  selectedStationId: string | null;
}

// Component to handle map centering logic
const MapUpdater = ({ stations, selectedStationId }: { stations: StationLocation[], selectedStationId: string | null }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedStationId) {
      const station = stations.find(s => s.id === selectedStationId);
      if (station) {
        map.flyTo([station.lat, station.lng], 9, { duration: 1.5 });
      }
    } else {
      // Default view of Pakistan
      map.flyTo([30.3753, 69.3451], 6, { duration: 1.5 });
    }
  }, [selectedStationId, stations, map]);

  return null;
};

const MapComponent: React.FC<MapProps> = ({ stations, onStationSelect, selectedStationId }) => {

  // Color scale based on metric type
  const getMarkerColor = (station: StationLocation) => {
    // Tarbela and Mangla are dams (storage) -> Blue
    if (station.id === 'tarbela' || station.id === 'mangla') return '#2563eb'; // blue-600
    // Panjnad is a confluence -> Teal
    if (station.id === 'panjnad') return '#0d9488'; // teal-600
    // Others -> Indigo
    return '#4f46e5';
  };

  const getRadius = (station: StationLocation) => {
    // Make significant dams slightly larger
    return (station.id === 'tarbela' || station.id === 'mangla') ? 12 : 8;
  };

  console.log("MapComponent received stations:", stations);

  return (
    <MapContainer
      center={[30.3753, 69.3451]}
      zoom={6}
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      {/* Used CartoDB Positron for a cleaner, high-contrast map suitable for data viz */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapUpdater stations={stations} selectedStationId={selectedStationId} />

      {stations.map((station) => {
        if (!station.lat || !station.lng) return null;

        return (
          <CircleMarker
            key={station.id}
            center={[station.lat, station.lng]}
            pathOptions={{
              color: '#000', 
              fillColor: getMarkerColor(station),
              fillOpacity: 1,
              weight: 3
            }}
            radius={15}
            eventHandlers={{
              click: () => onStationSelect(station),
            }}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-gray-800">{station.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{station.river} River</p>
                <div className="space-y-1">
                  {station.metrics.map((m, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{m.label}:</span>
                      <span className="font-mono font-semibold">{m.value.toLocaleString()} <span className="text-[10px]">{m.unit}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;