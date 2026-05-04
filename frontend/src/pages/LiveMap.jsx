import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLivePollution, socket } from '../services/api';
import L from 'leaflet';
import 'leaflet.heat';

// Map mock zones to real coordinates for visualization
const zoneCoordinates = {
  'Zone A': { lat: 28.7041, lng: 77.1025, name: 'Delhi (Zone A)' },
  'Zone B': { lat: 19.0760, lng: 72.8777, name: 'Mumbai (Zone B)' },
  'Zone C': { lat: 12.9716, lng: 77.5946, name: 'Bangalore (Zone C)' },
  'Zone D': { lat: 13.0827, lng: 80.2707, name: 'Chennai (Zone D)' },
};

// Component to handle the leaflet.heat layer dynamically
const HeatmapLayer = ({ zonesData }) => {
  const map = useMap();

  useEffect(() => {
    if (!zonesData || zonesData.length === 0) return;

    const heatPoints = zonesData.map(zone => [
        zone.lat, 
        zone.lng, 
        Math.min(zone.aqi / 300, 1.0)
    ]);

    const heatLayer = L.heatLayer(heatPoints, {
      radius: 50,
      blur: 30,
      maxZoom: 10,
      gradient: {
        0.4: 'yellow',
        0.6: 'orange',
        0.8: 'orangered',
        1.0: 'red'
      }
    });

    // Slight delay to ensure React/Leaflet DOM has height before canvas rendering
    const timer = setTimeout(() => {
      heatLayer.addTo(map);
    }, 100);

    return () => {
      clearTimeout(timer);
      map.removeLayer(heatLayer);
    };
  }, [map, zonesData]);

  return null;
};

const LiveMap = () => {
  const center = [20.5937, 78.9629]; // India Center
  const [zones, setZones] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchLivePollution()
      .then((data) => {
        const latestPerZone = {};
        data.forEach(reading => {
          if (!latestPerZone[reading.zone]) {
            latestPerZone[reading.zone] = reading;
          }
        });
        
        const mapData = Object.values(latestPerZone).map(formatZoneData);
        setZones(mapData);
      })
      .catch(console.error);

    // Listen for real-time updates from backend
    socket.on('newData', (newRecord) => {
      setZones((prevZones) => {
        const updatedZone = formatZoneData(newRecord);
        // Replace existing zone or add new one
        const exists = prevZones.find(z => z.originalZone === newRecord.zone);
        if (exists) {
          return prevZones.map(z => z.originalZone === newRecord.zone ? updatedZone : z);
        } else {
          return [...prevZones, updatedZone];
        }
      });
    });

    return () => socket.off('newData');
  }, []);

  // Helper to format raw DB data into map-friendly structure
  const formatZoneData = (reading) => {
    const coords = zoneCoordinates[reading.zone] || { lat: 20, lng: 78, name: reading.zone };
    return {
      id: reading._id || Math.random().toString(),
      originalZone: reading.zone,
      name: coords.name,
      lat: coords.lat,
      lng: coords.lng,
      aqi: reading.aqi,
      risk: reading.risk_level,
      timestamp: reading.timestamp
    };
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <h1 className="text-3xl font-bold text-gray-800">Live Pollution Heatmap</h1>
      <div className="flex-1 glass-card rounded-xl overflow-hidden relative z-0" style={{ minHeight: '600px' }}>
        <MapContainer center={center} zoom={5} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {/* Inject the heatmap layer component */}
          <HeatmapLayer zonesData={zones} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
