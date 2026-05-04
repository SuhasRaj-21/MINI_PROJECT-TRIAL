import React, { useEffect, useState } from 'react';
import { fetchLivePollution, socket } from '../services/api';
import { Wind, MapPin, AlertTriangle, Activity, Clock } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchLivePollution().then(setData).catch(console.error);

    socket.on('newData', (newRecord) => {
      setData((prev) => [newRecord, ...prev].slice(0, 50));
    });

    return () => socket.off('newData');
  }, []);

  const latest = data[0] || {};
  
  // Calculate dynamic stats
  const uniqueZones = new Set(data.map(d => d.zone)).size || 4;
  const recentAlerts = data.filter(d => d.aqi > 150).length || 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Real-time emission monitoring and air quality tracking.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">Live Updates Active</span>
        </div>
      </div>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard 
          title="Current AQI (Avg)" 
          value={latest.aqi || '--'} 
          icon={<Wind className="text-blue-500" size={24} />} 
          trend={latest.aqi > 100 ? '+12% (Rising)' : '-5% (Dropping)'}
          trendColor={latest.aqi > 100 ? 'text-red-500' : 'text-green-500'}
        />
        <StatCard 
          title="Active Zones Tracked" 
          value={uniqueZones} 
          icon={<MapPin className="text-indigo-500" size={24} />} 
          trend="All systems nominal"
          trendColor="text-gray-500"
        />
        <StatCard 
          title="Hazardous Alerts" 
          value={recentAlerts} 
          icon={<AlertTriangle className="text-red-500" size={24} />} 
          trend="Last 24 Hours"
          trendColor="text-gray-500"
        />
        <StatCard 
          title="Current Risk Level" 
          value={latest.risk_level || '--'} 
          icon={<Activity className="text-orange-500" size={24} />} 
          trend="Based on highest zone"
          trendColor="text-gray-500"
        />
      </div>

      {/* Main Table Section */}
      <div className="glass-card rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="px-6 py-5 border-b border-white/40 flex justify-between items-center bg-white/30 backdrop-blur-md">
          <h2 className="text-xl font-extrabold text-slate-900">Recent Sensor Readings</h2>
          <button className="text-sm font-bold text-sky-700 hover:text-sky-900 bg-white/60 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">View Full History</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-semibold rounded-tl-lg">Zone Location</th>
                <th className="p-4 font-semibold">AQI Index</th>
                <th className="p-4 font-semibold">PM 2.5</th>
                <th className="p-4 font-semibold">Vehicles/Hr</th>
                <th className="p-4 font-semibold">Risk Level</th>
                <th className="p-4 font-semibold rounded-tr-lg text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {data.length > 0 ? data.map((row, i) => (
                <tr key={i} className="hover:bg-sky-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                        <MapPin size={16} />
                      </div>
                      <span className="font-medium text-gray-900">{row.zone}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-900 font-bold">{row.aqi}</span>
                  </td>
                  <td className="p-4 text-gray-600">{row.pm25} µg/m³</td>
                  <td className="p-4 text-gray-600">{row.vehicle_count}</td>
                  <td className="p-4">
                    <RiskBadge risk={row.risk_level} />
                  </td>
                  <td className="p-4 text-right text-gray-500 flex items-center justify-end space-x-1">
                    <Clock size={14} className="opacity-50" />
                    <span>{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">Waiting for live data...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, trendColor }) => (
  <div className="glass-card p-6 rounded-2xl flex flex-col transition-shadow duration-300 relative overflow-hidden">
    {/* Decorative blur blob */}
    <div className="absolute -top-4 -right-4 w-20 h-20 bg-sky-500/10 rounded-full blur-2xl"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</span>
      <div className="p-2 bg-white/60 rounded-lg shadow-sm">
        {icon}
      </div>
    </div>
    <div className="mt-auto relative z-10">
      <span className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</span>
      <p className={`text-xs font-bold mt-2 ${trendColor}`}>{trend}</p>
    </div>
  </div>
);

const RiskBadge = ({ risk }) => {
  let styles = "bg-gray-100 text-gray-800 border-gray-200";
  
  if (risk === "Good") styles = "bg-green-100 text-green-800 border-green-200";
  if (risk === "Moderate") styles = "bg-orange-100 text-orange-800 border-orange-200";
  if (risk === "Unhealthy for Sensitive Groups" || risk === "Unhealthy") styles = "bg-red-100 text-red-800 border-red-200";
  if (risk === "Hazardous" || risk === "Very Unhealthy") styles = "bg-purple-100 text-purple-800 border-purple-200 animate-pulse";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase ${styles}`}>
      {risk}
    </span>
  );
};

export default Dashboard;
