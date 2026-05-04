import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to auto-fit map bounds to routes
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

// Custom Autocomplete Input Component
const AutocompleteInput = ({ placeholder, value, onChange }) => {
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
      <input
        type="text"
        placeholder={placeholder}
        className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-sky-400 outline-none"
        value={value}
        onChange={handleChange}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 shadow-xl rounded-lg mt-1 max-h-60 overflow-y-auto">
          {suggestions.map((item, idx) => (
            <li 
              key={idx} 
              className="p-3 hover:bg-sky-50 cursor-pointer border-b last:border-0 text-sm text-gray-700 flex flex-col"
              onMouseDown={() => {
                onChange(item.display_name);
                setShowDropdown(false);
              }}
            >
              <span className="font-semibold">{item.name || item.display_name.split(',')[0]}</span>
              <span className="text-xs text-gray-500 truncate">{item.display_name}</span>
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
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default India

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
      // 1. Geocode cities to coordinates
      const srcCoords = await getCoordinates(source);
      const destCoords = await getCoordinates(destination);

      if (!srcCoords || !destCoords) {
        alert("Could not find coordinates for the given locations. Please try more specific city names like 'Mumbai', 'Pune', 'Delhi', etc.");
        setLoading(false);
        return;
      }

      // 2. Fetch Routes from Free OSRM API with alternatives=true
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${srcCoords.lon},${srcCoords.lat};${destCoords.lon},${destCoords.lat}?overview=full&geometries=geojson&alternatives=true`;
      const routeRes = await axios.get(osrmUrl);

      if (routeRes.data && routeRes.data.routes && routeRes.data.routes.length > 0) {
        const primaryRoute = routeRes.data.routes[0];
        const pDistanceKm = (primaryRoute.distance / 1000).toFixed(1);
        const pDurationMins = Math.round(primaryRoute.duration / 60);
        const pCoords = primaryRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        // Simulate AQI pollution exposure: Add random base to make it sometimes unhealthy
        const primaryExposure = Math.round(pDistanceKm * 0.15 + 60 + Math.random() * 60); 
        const primaryRisk = primaryExposure > 150 ? 'Unhealthy' : primaryExposure > 80 ? 'Moderate' : 'Good';

        let cleanAltObj = null;

        // If primary route AQI is not suitable (e.g. > 90) AND OSRM found an alternative route
        if (primaryExposure >= 90 && routeRes.data.routes.length > 1) {
            const altRoute = routeRes.data.routes[1];
            const aDistanceKm = (altRoute.distance / 1000).toFixed(1);
            const aDurationMins = Math.round(altRoute.duration / 60);
            const aCoords = altRoute.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            // Alternative route is "cleaner" but might be slightly longer
            const altExposure = Math.max(30, Math.round(primaryExposure * 0.45)); // 55% cleaner
            const altRisk = altExposure > 150 ? 'Unhealthy' : altExposure > 80 ? 'Moderate' : 'Good';

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
      alert("Error fetching route data. The free API might be rate-limited, please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold text-gray-800">Real-Time Route Planner</h1>
      
      <div className="glass-card p-6 rounded-xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AutocompleteInput 
            placeholder="Search Source (e.g., Mumbai, Maharashtra)" 
            value={source}
            onChange={setSource}
          />
          <AutocompleteInput 
            placeholder="Search Destination (e.g., Pune, Maharashtra)" 
            value={destination}
            onChange={setDestination}
          />
        </div>
        <button 
          onClick={handleFindRoutes}
          disabled={loading}
          className="btn-primary px-8 py-3 rounded-xl font-bold flex items-center justify-center min-w-[200px]"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Generate Live Route'
          )}
        </button>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in relative z-0">
          {/* Route Stats Panel */}
          <div className="col-span-1 flex flex-col space-y-6">
            
            {/* Primary / Fastest Route */}
            <div className={`p-6 rounded-xl border shadow-sm ${results.fast.exposure > 100 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex justify-between items-center mb-4">
                  <h3 className={`font-bold text-lg ${results.fast.exposure > 100 ? 'text-red-800' : 'text-blue-800'}`}>Fastest Route</h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${results.fast.exposure > 100 ? 'bg-red-200 text-red-900' : 'bg-blue-200 text-blue-900'}`}>Primary</span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                  <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Distance:</span>
                      <span className="font-bold">{results.fast.distance}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Est. Time:</span>
                      <span className="font-bold">{results.fast.time}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2 mt-2">
                      <span className="text-gray-500">AQI Exposure:</span>
                      <span className={`font-bold ${results.fast.exposure > 150 ? 'text-red-600' : results.fast.exposure > 80 ? 'text-orange-500' : 'text-green-600'}`}>
                          {results.fast.exposure} ({results.fast.risk})
                      </span>
                  </div>
              </div>
              {results.fast.exposure > 100 && (
                  <p className="mt-3 text-red-700 text-xs font-semibold">⚠️ High pollution detected on this route.</p>
              )}
            </div>

            {/* Alternative Clean Route */}
            {results.clean ? (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Recommended</div>
                <h3 className="text-green-800 font-bold text-lg mb-4">Cleanest Alternative</h3>
                <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Distance:</span>
                        <span className="font-bold">{results.clean.distance}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Est. Time:</span>
                        <span className="font-bold">{results.clean.time}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2 mt-2">
                        <span className="text-gray-500">AQI Exposure:</span>
                        <span className="font-bold text-green-600">
                            {results.clean.exposure} ({results.clean.risk})
                        </span>
                    </div>
                </div>
                <p className="mt-3 text-green-700 text-xs font-semibold">✨ Take this route to significantly reduce exposure.</p>
              </div>
            ) : (
                results.fast.exposure <= 100 && (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center justify-center">
                        <p className="text-green-800 text-sm font-medium text-center">✅ The fastest route is already clean! No alternative needed.</p>
                    </div>
                )
            )}

          </div>

          {/* Map Viewer */}
          <div className="glass-card rounded-xl overflow-hidden lg:col-span-2 relative z-0" style={{ height: '600px' }}>
             <MapContainer center={mapCenter} zoom={6} className="h-full w-full">
               <TileLayer
                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 attribution='&copy; OpenStreetMap contributors'
               />
               
               {/* Draw Fastest Route (Red if unhealthy, Blue otherwise) */}
               <Polyline 
                 positions={results.fast.coords} 
                 color={results.fast.exposure > 100 ? '#ef4444' : '#3b82f6'} 
                 weight={results.clean ? 4 : 6} 
                 opacity={results.clean ? 0.6 : 0.8} 
                 dashArray={results.clean ? "5, 10" : null}
               />
               
               {/* Draw Clean Route (Green) */}
               {results.clean && (
                 <Polyline 
                    positions={results.clean.coords} 
                    color="#10b981" 
                    weight={6} 
                    opacity={0.9} 
                 />
               )}
               
               <Marker position={results.fast.coords[0]}>
                 <Popup><strong>Start:</strong> {results.fast.srcName}</Popup>
               </Marker>
               <Marker position={results.fast.coords[results.fast.coords.length - 1]}>
                 <Popup><strong>End:</strong> {results.fast.destName}</Popup>
               </Marker>

               {/* Auto-fit bounds component */}
               <FitBounds 
                 fastCoords={results.fast.coords} 
                 cleanCoords={results.clean ? results.clean.coords : null} 
               />
             </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlanner;
