import React, { useEffect, useState, useRef } from 'react';
import { fetchLivePollution, socket } from '../services/api';
import { Wind, MapPin, AlertTriangle, Activity, Clock, Map, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const zoneCoordinates = {
  'Zone A': { lat: 28.7041, lng: 77.1025, name: 'Delhi (Zone A)' },
  'Zone B': { lat: 19.0760, lng: 72.8777, name: 'Mumbai (Zone B)' },
  'Zone C': { lat: 12.9716, lng: 77.5946, name: 'Bangalore (Zone C)' },
  'Zone D': { lat: 13.0827, lng: 80.2707, name: 'Chennai (Zone D)' },
};

const AutocompleteInput = ({ placeholder, onLocationSelect }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`);
      setSuggestions(res.data);
    } catch (e) {
      console.error("Autocomplete error", e);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setValue(val);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  return (
    <div className="relative w-full md:w-72 z-50">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-sky-400" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="input-premium pl-10 w-full text-sm py-2 rounded-xl border border-slate-700 bg-slate-800/80 text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          value={value}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute w-full bg-slate-800 border border-slate-700 shadow-2xl rounded-lg mt-2 max-h-60 overflow-y-auto backdrop-blur-xl">
          {suggestions.map((item, idx) => (
            <li 
              key={idx} 
              className="p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700/50 last:border-0 text-sm text-slate-200 flex flex-col transition-colors"
              onMouseDown={() => {
                setValue(item.display_name.split(',')[0]);
                setShowDropdown(false);
                onLocationSelect(item);
              }}
            >
              <span className="font-semibold text-sky-400">{item.name || item.display_name.split(',')[0]}</span>
              <span className="text-xs text-slate-400 truncate">{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
        0.4: '#38BDF8',
        0.6: '#F59E0B',
        0.8: '#F43F5E',
        1.0: '#8B5CF6'
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

// Component to recenter map
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [mapZones, setMapZones] = useState([]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);

  useEffect(() => {
    fetchLivePollution().then((resData) => {
      setData(resData);
      
      const latestPerZone = {};
      resData.forEach(reading => {
        if (!latestPerZone[reading.zone]) {
          latestPerZone[reading.zone] = reading;
        }
      });
      
      const mapData = Object.values(latestPerZone).map(formatZoneData);
      setMapZones(mapData);
    }).catch(console.error);

    socket.on('newData', (newRecord) => {
      setData((prev) => [newRecord, ...prev].slice(0, 50));
      
      setMapZones((prevZones) => {
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
    // Check if the reading already has coordinates (from search)
    if (reading.lat && reading.lng) {
      return {
        id: reading._id || Math.random().toString(),
        originalZone: reading.zone,
        name: reading.zone,
        lat: reading.lat,
        lng: reading.lng,
        aqi: reading.aqi,
        risk: reading.risk_level,
        timestamp: reading.timestamp
      };
    }

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

  const handleLocationSearch = async (locationItem) => {
    const lat = parseFloat(locationItem.lat);
    const lng = parseFloat(locationItem.lon);
    const name = locationItem.display_name.split(',')[0];

    setMapCenter([lat, lng]);

    // Simulate calling ML API or predicting AQI for the searched location
    // Here we generate a realistic simulated reading
    const simulatedAqi = Math.round(50 + Math.random() * 150);
    const riskLevel = simulatedAqi > 150 ? 'Unhealthy' : simulatedAqi > 100 ? 'Unhealthy for Sensitive Groups' : 'Moderate';
    
    const newReading = {
      _id: Math.random().toString(),
      zone: name,
      lat: lat,
      lng: lng,
      aqi: simulatedAqi,
      pm25: simulatedAqi * 0.5,
      risk_level: riskLevel,
      timestamp: new Date().toISOString()
    };

    // Add to table
    setData((prev) => [newReading, ...prev].slice(0, 50));
    
    // Add to Map Zones
    setMapZones((prev) => {
      const updatedZone = formatZoneData(newReading);
      const filtered = prev.filter(z => z.originalZone !== name);
      return [...filtered, updatedZone];
    });
  };

  const latest = data[0] || {};
  const uniqueZones = new Set(data.map(d => d.zone)).size || 4;
  const recentAlerts = data.filter(d => d.aqi > 150).length || 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 variants={itemVariants} className="text-3xl font-bold text-slate-100 tracking-tight">Dashboard Overview</motion.h1>
          <motion.p variants={itemVariants} className="text-slate-400 mt-1">Real-time emission monitoring and air quality tracking.</motion.p>
        </div>
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
          <AutocompleteInput 
            placeholder="Search city or location..." 
            onLocationSelect={handleLocationSearch} 
          />
          <div className="flex items-center space-x-3 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700/50 backdrop-blur-md">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-sm font-medium text-slate-300">Live</span>
          </div>
        </motion.div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Current AQI (Avg)" 
          value={latest.aqi ? Math.round(latest.aqi) : '--'} 
          icon={<Wind className="text-sky-400" size={24} />} 
          trend={latest.aqi > 100 ? '+12% (Rising)' : '-5% (Dropping)'}
          trendColor={latest.aqi > 100 ? 'text-rose-400' : 'text-emerald-400'}
          delay={0.1}
        />
        <StatCard 
          title="Active Zones" 
          value={uniqueZones} 
          icon={<MapPin className="text-indigo-400" size={24} />} 
          trend="All systems nominal"
          trendColor="text-slate-400"
          delay={0.2}
        />
        <StatCard 
          title="Hazardous Alerts" 
          value={recentAlerts} 
          icon={<AlertTriangle className="text-rose-400" size={24} />} 
          trend="Last 24 Hours"
          trendColor="text-slate-400"
          delay={0.3}
        />
        <StatCard 
          title="Risk Level" 
          value={latest.risk_level || '--'} 
          icon={<Activity className="text-amber-400" size={24} />} 
          trend="Based on highest zone"
          trendColor="text-slate-400"
          delay={0.4}
        />
      </div>

      {/* Grid Layout for Map and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mini Heatmap Section */}
        <motion.div variants={itemVariants} className="glass-card overflow-hidden relative lg:col-span-1 border border-slate-700/50 flex flex-col min-h-[400px]">
          <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-900/50 relative z-10">
            <h2 className="text-lg font-bold text-slate-100 flex items-center">
              <Map className="mr-2 text-sky-400" size={18} />
              Quick Heatmap
            </h2>
          </div>
          <div className="flex-1 relative w-full h-full p-2">
            <div className="w-full h-full rounded-xl overflow-hidden relative z-0">
              <div className="absolute inset-0 pointer-events-none border border-sky-500/20 rounded-xl z-20"></div>
              <MapContainer center={mapCenter} zoom={4} className="h-full w-full z-0" zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <MapUpdater center={mapCenter} />
                <HeatmapLayer zonesData={mapZones} />
              </MapContainer>
            </div>
          </div>
        </motion.div>

        {/* Main Table Section */}
        <motion.div variants={itemVariants} className="glass-card overflow-hidden relative lg:col-span-2">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="px-6 py-5 border-b border-slate-700/50 flex justify-between items-center relative z-10 bg-slate-900/50">
            <h2 className="text-lg font-bold text-slate-100">Live Sensor Streams</h2>
            <button className="text-xs font-semibold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-lg border border-sky-500/20 transition-all">
              Export Data
            </button>
          </div>
          <div className="overflow-x-auto relative z-10 max-h-[400px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-20 bg-slate-800/90 backdrop-blur-md">
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/50">
                  <th className="p-4 font-semibold">Zone</th>
                  <th className="p-4 font-semibold">AQI</th>
                  <th className="p-4 font-semibold">PM 2.5</th>
                  <th className="p-4 font-semibold">Risk Level</th>
                  <th className="p-4 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {data.length > 0 ? data.map((row, i) => {
                  const mappedZoneName = row.name || zoneCoordinates[row.zone]?.name || row.zone;
                  return (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.02 }}
                      key={row._id || i} 
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 border border-slate-700 group-hover:border-sky-500/50 transition-all">
                            <MapPin size={12} />
                          </div>
                          <span className="font-medium text-slate-200">{mappedZoneName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-100 font-bold">{Math.round(row.aqi)}</span>
                      </td>
                      <td className="p-4 text-slate-400">{row.pm25?.toFixed(1)}</td>
                      <td className="p-4">
                        <RiskBadge risk={row.risk_level} />
                      </td>
                      <td className="p-4 text-right text-slate-500 flex items-center justify-end space-x-2">
                        <Clock size={12} className="opacity-70" />
                        <span className="font-mono text-[10px]">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </td>
                    </motion.tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
                        <p>Initializing secure data streams...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, trend, trendColor, delay }) => (
  <motion.div 
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 300, damping: 24, delay: delay }}
    className="glass-card p-6 flex flex-col relative overflow-hidden group"
  >
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/5 rounded-full blur-3xl group-hover:bg-sky-500/10 transition-all duration-500"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className="p-2.5 bg-slate-800/80 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] border border-slate-700/50 group-hover:border-sky-500/30 transition-colors">
        {icon}
      </div>
    </div>
    <div className="mt-auto relative z-10">
      <span className="text-3xl font-bold text-slate-100 tracking-tight">{value}</span>
      <p className={`text-xs font-medium mt-2 flex items-center space-x-1 ${trendColor}`}>
        <span>{trend}</span>
      </p>
    </div>
  </motion.div>
);

const RiskBadge = ({ risk }) => {
  let styles = "bg-slate-800/50 text-slate-300 border-slate-700/50";
  let dot = "bg-slate-400";
  
  if (risk === "Good") {
    styles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
    dot = "bg-emerald-400";
  }
  if (risk === "Moderate") {
    styles = "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]";
    dot = "bg-amber-400";
  }
  if (risk === "Unhealthy for Sensitive Groups" || risk === "Unhealthy") {
    styles = "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
    dot = "bg-rose-400";
  }
  if (risk === "Hazardous" || risk === "Very Unhealthy") {
    styles = "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
    dot = "bg-purple-400 animate-pulse";
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold border uppercase tracking-wider ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${dot}`}></span>
      {risk}
    </span>
  );
};

export default Dashboard;
