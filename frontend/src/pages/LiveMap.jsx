import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchLivePollution, socket } from '../services/api';
import L from 'leaflet';
import 'leaflet.heat';
import { motion } from 'framer-motion';
import { Map as MapIcon } from 'lucide-react';

const zoneCoordinates = {
  'Zone A': { lat: 28.7041, lng: 77.1025, name: 'Delhi (Zone A)' },
  'Zone B': { lat: 19.0760, lng: 72.8777, name: 'Mumbai (Zone B)' },
  'Zone C': { lat: 12.9716, lng: 77.5946, name: 'Bangalore (Zone C)' },
  'Zone D': { lat: 13.0827, lng: 80.2707, name: 'Chennai (Zone D)' },
};

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
      radius: 40,
      blur: 25,
      maxZoom: 10,
      gradient: {
        0.4: '#38BDF8', // Sky
        0.6: '#F59E0B', // Amber
        0.8: '#F43F5E', // Rose
        1.0: '#8B5CF6'  // Violet (Hazardous)
      }
    });

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
  const center = [20.5937, 78.9629]; 
  const [zones, setZones] = useState([]);

  useEffect(() => {
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

    socket.on('newData', (newRecord) => {
      setZones((prevZones) => {
        const updatedZone = formatZoneData(newRecord);
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col space-y-6 pb-10"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center tracking-tight">
            <MapIcon className="mr-3 text-sky-400" size={24} />
            Global Emission Heatmap
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Real-time geographical emission distribution across zones.</p>
        </div>
      </div>
      
      <div className="flex-1 glass-card rounded-2xl overflow-hidden relative z-0 p-1.5" style={{ minHeight: '600px' }}>
        <div className="w-full h-full rounded-xl overflow-hidden relative border border-slate-700/50">
          
          <MapContainer center={center} zoom={5} className="h-full w-full bg-[#0F172A]">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            />
            <HeatmapLayer zonesData={zones} />
          </MapContainer>

          {/* Floating Legend */}
          <div className="absolute bottom-6 right-6 z-[400] bg-[#1E293B]/90 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AQI Intensity</h4>
            <div className="space-y-2">
              <LegendItem color="bg-sky-400" label="Good (0-50)" />
              <LegendItem color="bg-amber-400" label="Moderate (51-100)" />
              <LegendItem color="bg-rose-400" label="Unhealthy (101-200)" />
              <LegendItem color="bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" label="Hazardous (200+)" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LegendItem = ({ color, label }) => (
  <div className="flex items-center space-x-2">
    <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
    <span className="text-xs text-slate-300 font-medium">{label}</span>
  </div>
);

export default LiveMap;
