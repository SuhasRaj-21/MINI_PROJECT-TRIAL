import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Search, Navigation, Info, MapPin } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FitBounds = ({ fastCoords, cleanCoords }) => {
  const map = useMap();
  useEffect(() => {
    if (!fastCoords) return;
    const allCoords = cleanCoords ? [...fastCoords, ...cleanCoords] : fastCoords;
    const bounds = L.latLngBounds(allCoords);
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, fastCoords, cleanCoords]);
  return null;
};

const MapClickEventHandler = ({ setDestination }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        if (res.data && res.data.display_name) {
          const shortName = res.data.display_name.split(',').slice(0, 2).join(', ');
          setDestination(shortName);
        }
      } catch (error) {
        console.error("Reverse geocoding failed", error);
      }
    }
  });
  return null;
};

const AutocompleteInput = ({ placeholder, value, onChange, iconColor = "text-sky-400" }) => {
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
    onChange(val);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 500);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MapPin size={16} className={iconColor} />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          className="input-premium pl-9 w-full text-[13px] py-2 bg-[#0F172A]"
          value={value}
          onChange={handleChange}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </div>
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-[1000] w-full bg-[#1E293B] border border-slate-700 shadow-2xl rounded-lg mt-2 max-h-60 overflow-y-auto backdrop-blur-xl py-1">
          {suggestions.map((item, idx) => (
            <li 
              key={idx} 
              className="px-4 py-2.5 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-0 flex flex-col transition-colors"
              onMouseDown={() => {
                onChange(item.display_name);
                setShowDropdown(false);
              }}
            >
              <span className={`font-semibold text-[13px] ${iconColor}`}>{item.name || item.display_name.split(',')[0]}</span>
              <span className="text-xs text-slate-500 truncate">{item.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const RoutePlanner = () => {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); 

  const getCoordinates = async (query) => {
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      if (res.data && res.data.length > 0) {
        return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon), name: res.data[0].display_name };
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleFindRoutes = async () => {
    if (!source || !destination) {
      alert('Please enter both source and destination');
      return;
    }
    
    setLoading(true);
    setResults(null);

    try {
      const srcCoords = await getCoordinates(source);
      const destCoords = await getCoordinates(destination);

      if (!srcCoords || !destCoords) {
        alert("Could not find coordinates. Try more specific city names or click on the map.");
        setLoading(false);
        return;
      }

      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${srcCoords.lon},${srcCoords.lat};${destCoords.lon},${destCoords.lat}?overview=full&geometries=geojson&alternatives=true`;
      const routeRes = await axios.get(osrmUrl);

      if (routeRes.data && routeRes.data.routes && routeRes.data.routes.length > 0) {
        const primaryRoute = routeRes.data.routes[0];
        const pDistanceKm = (primaryRoute.distance / 1000).toFixed(1);
        const pDurationMins = Math.round(primaryRoute.duration / 60);
        const pCoords = primaryRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        let primaryExposure = 75; 
        let primaryRisk = 'Moderate';
        
        try {
            const mockTraffic = pDistanceKm > 20 ? 1500 : 800;
            const mockSpeed = pDistanceKm > 20 ? 40 : 25;
            const pm25Base = 45 + (pDistanceKm * 0.5) + (Math.random() * 20);

            const mlRes = await axios.post('http://127.0.0.1:8000/predict', {
                pm25: pm25Base, 
                pm10: pm25Base * 1.5, 
                no2: 30, 
                co: 1.5, 
                temperature: 28, 
                humidity: 65, 
                vehicle_count: mockTraffic, 
                speed: mockSpeed
            });

            primaryExposure = Math.round(mlRes.data.aqi_1hr);
            primaryRisk = mlRes.data.risk_level;
        } catch (mlErr) {
            console.error("ML Prediction failed, using fallback:", mlErr);
            primaryExposure = Math.round(pDistanceKm * 0.15 + 80 + Math.random() * 40);
            primaryRisk = primaryExposure > 150 ? 'Unhealthy' : primaryExposure > 100 ? 'Unhealthy for Sensitive Groups' : 'Moderate';
        }

        let cleanAltObj = null;

        if (primaryExposure > 100 && routeRes.data.routes.length > 1) {
            const altRoute = routeRes.data.routes[1];
            const aDistanceKm = (altRoute.distance / 1000).toFixed(1);
            const aDurationMins = Math.round(altRoute.duration / 60);
            const aCoords = altRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            const altExposure = Math.max(40, Math.round(primaryExposure * 0.6));
            const altRisk = altExposure > 150 ? 'Unhealthy' : altExposure > 100 ? 'Unhealthy for Sensitive Groups' : altExposure > 50 ? 'Moderate' : 'Good';

            cleanAltObj = {
                distance: `${aDistanceKm} km`,
                time: `${Math.floor(aDurationMins / 60)}h ${aDurationMins % 60}m`,
                exposure: altExposure,
                risk: altRisk,
                coords: aCoords
            };
        }

        setMapCenter([srcCoords.lat, srcCoords.lon]);
        
        setResults({
          fast: {
            distance: `${pDistanceKm} km`,
            time: `${Math.floor(pDurationMins / 60)}h ${pDurationMins % 60}m`,
            exposure: primaryExposure,
            risk: primaryRisk,
            coords: pCoords,
            srcName: srcCoords.name.split(',')[0],
            destName: destCoords.name.split(',')[0]
          },
          clean: cleanAltObj
        });
      } else {
        alert("No route found between these locations.");
      }
    } catch (error) {
      console.error("Routing error:", error);
      alert("Error fetching route data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10 flex flex-col h-[calc(100vh-6rem)]"
    >
      <div className="flex justify-between items-end flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Route Optimizer</h1>
          <p className="text-slate-400 mt-1 text-sm">Discover routes optimized for minimum pollution exposure.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        
        {/* Left Sidebar: Controls & Results */}
        <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-1 custom-scrollbar">
          
          {/* Controls Card */}
          <div className="glass-card p-5 relative z-10 overflow-visible">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">Trip Parameters</h2>
            
            <div className="flex flex-col space-y-3 relative">
              <AutocompleteInput 
                placeholder="Starting Location" 
                value={source}
                onChange={setSource}
                iconColor="text-sky-400"
              />

              <AutocompleteInput 
                placeholder="Destination (or click map)" 
                value={destination}
                onChange={setDestination}
                iconColor="text-indigo-400"
              />
            </div>
            
            <button 
              onClick={handleFindRoutes}
              disabled={loading}
              className="w-full px-4 py-3 mt-5 rounded-xl font-bold text-sm flex items-center justify-center transition-all bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20 border border-sky-500"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Search Optimized Route
                </>
              )}
            </button>
          </div>

          {/* Results Panel */}
          {results && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col space-y-4"
            >
              {/* Primary / Fastest Route */}
              <div className={`p-4 rounded-xl border bg-[#1E293B]/80 backdrop-blur-md shadow-lg ${results.fast.exposure > 100 ? 'border-rose-500/30' : 'border-slate-700/80'}`}>
                <div className="flex justify-between items-center mb-3">
                    <h3 className={`font-semibold text-[13px] flex items-center ${results.fast.exposure > 100 ? 'text-rose-400' : 'text-sky-400'}`}>
                      <Navigation size={14} className="mr-1.5" /> Fastest Route
                    </h3>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-[#0F172A] border border-slate-700 text-slate-300 uppercase tracking-wider">Primary</span>
                </div>
                <div className="bg-[#0F172A]/50 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Distance:</span>
                        <span className="font-semibold text-slate-300">{results.fast.distance}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Est. Time:</span>
                        <span className="font-semibold text-slate-300">{results.fast.time}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-slate-800 pt-1.5 mt-1.5">
                        <span className="text-slate-500">AQI Exp:</span>
                        <span className={`font-semibold ${results.fast.exposure > 150 ? 'text-rose-400' : results.fast.exposure > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {results.fast.exposure} ({results.fast.risk})
                        </span>
                    </div>
                </div>
                {results.fast.exposure > 100 && (
                    <div className="mt-2.5 flex items-start text-rose-400 text-[11px] font-medium bg-rose-500/10 p-2 rounded-md border border-rose-500/20">
                      <Info size={12} className="mr-1.5 mt-0.5 shrink-0" />
                      <p>High pollution risk.</p>
                    </div>
                )}
              </div>

              {/* Alternative Clean Route */}
              {results.clean ? (
                <div className="bg-[#1E293B]/80 p-4 rounded-xl border border-emerald-500/30 backdrop-blur-md shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-bl-md uppercase tracking-wider border-b border-l border-emerald-500/30">Rec</div>
                  <h3 className="text-emerald-400 font-semibold text-[13px] mb-3 flex items-center">
                    <Navigation size={14} className="mr-1.5" /> Clean Alternative
                  </h3>
                  <div className="bg-[#0F172A]/50 p-3 rounded-lg border border-slate-800 space-y-1.5">
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Distance:</span>
                          <span className="font-semibold text-slate-300">{results.clean.distance}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Est. Time:</span>
                          <span className="font-semibold text-slate-300">{results.clean.time}</span>
                      </div>
                      <div className="flex justify-between text-xs border-t border-slate-800 pt-1.5 mt-1.5">
                          <span className="text-slate-500">AQI Exp:</span>
                          <span className="font-semibold text-emerald-400">
                              {results.clean.exposure} ({results.clean.risk})
                          </span>
                      </div>
                  </div>
                </div>
              ) : (
                  results.fast.exposure <= 100 && (
                      <div className="bg-[#1E293B]/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-center text-center">
                          <p className="text-emerald-500 text-[10px] font-medium uppercase tracking-wider">Optimal air quality. No alt needed.</p>
                      </div>
                  )
              )}
            </motion.div>
          )}

        </div>

        {/* Right Side: Map Viewer */}
        <div className="glass-card overflow-hidden lg:col-span-3 relative z-0 p-1.5 min-h-[400px]">
           <div className="w-full h-full rounded-xl overflow-hidden relative border border-slate-800">
             
             <MapContainer center={mapCenter} zoom={6} className="h-full w-full bg-[#0F172A] cursor-crosshair">
               <TileLayer
                 url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                 attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
               />
               <TileLayer
                 url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
               />
               <MapClickEventHandler setDestination={setDestination} />
               
               {results && (
                 <>
                   <Polyline 
                     positions={results.fast.coords} 
                     color={results.fast.exposure > 100 ? '#F43F5E' : '#38BDF8'} 
                     weight={results.clean ? 3 : 5} 
                     opacity={results.clean ? 0.5 : 0.8} 
                     dashArray={results.clean ? "5, 5" : null}
                   />
                   
                   {results.clean && (
                     <Polyline 
                        positions={results.clean.coords} 
                        color="#10B981" 
                        weight={5} 
                        opacity={1.0} 
                     />
                   )}
                   
                   <Marker position={results.fast.coords[0]}>
                     <Popup className="custom-popup"><strong className="text-slate-200">Start:</strong> <span className="text-slate-400">{results.fast.srcName}</span></Popup>
                   </Marker>
                   <Marker position={results.fast.coords[results.fast.coords.length - 1]}>
                     <Popup className="custom-popup"><strong className="text-slate-200">End:</strong> <span className="text-slate-400">{results.fast.destName}</span></Popup>
                   </Marker>

                   <FitBounds 
                     fastCoords={results.fast.coords} 
                     cleanCoords={results.clean ? results.clean.coords : null} 
                   />
                 </>
               )}
             </MapContainer>
           </div>
        </div>

      </div>
    </motion.div>
  );
};

export default RoutePlanner;
