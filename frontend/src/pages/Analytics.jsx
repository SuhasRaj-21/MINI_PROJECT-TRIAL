import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { BarChart, Activity, TrendingUp } from 'lucide-react';

const Analytics = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [scatterData, setScatterData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data for charts
  useEffect(() => {
    // Generate synthetic historical data for 24 hours
    const generateData = () => {
      const data = [];
      let baseAqi = 80;
      for(let i=24; i>=0; i--) {
        const time = new Date();
        time.setHours(time.getHours() - i);
        
        // Random walk
        baseAqi = Math.max(30, Math.min(300, baseAqi + (Math.random() * 40 - 20)));
        
        data.push({
          time: time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          aqi: Math.round(baseAqi),
          pm25: Math.round(baseAqi * 0.4),
          pm10: Math.round(baseAqi * 0.7),
        });
      }
      setHistoricalData(data);

      // Generate synthetic scatter data (Traffic vs AQI)
      const sData = [];
      for(let i=0; i<50; i++) {
        const traffic = Math.floor(Math.random() * 4000) + 500; // 500 to 4500 vehicles
        // AQI correlates loosely with traffic
        const aqi = Math.round((traffic / 4000) * 150 + 40 + (Math.random() * 50 - 25));
        sData.push({
          traffic,
          aqi,
          z: 100 // for bubble size
        });
      }
      setScatterData(sData);
      setLoading(false);
    };

    generateData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0F172A] border border-slate-700 p-4 rounded-xl shadow-xl">
          <p className="text-slate-100 font-bold mb-3 text-sm">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm mb-1.5 last:mb-0">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
              <span className="text-slate-400 font-medium capitalize">{entry.name}:</span>
              <span className="font-bold text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center">
            <BarChart className="mr-3 text-sky-400" size={24} />
            Advanced Analytics
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Deep insights, historical trends, and predictive forecasting.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* AQI 24H Trend Chart */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col h-[400px]">
            <div className="mb-6 flex items-center">
              <Activity className="text-sky-400 mr-2" size={18} />
              <h2 className="text-sm font-semibold text-slate-200">24-Hour AQI Trend</h2>
            </div>
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="aqi" name="AQI" stroke="#38BDF8" strokeWidth={2} fillOpacity={1} fill="url(#colorAqi)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* PM2.5 vs PM10 Chart */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col h-[400px]">
            <div className="mb-6 flex items-center">
              <TrendingUp className="text-indigo-400 mr-2" size={18} />
              <h2 className="text-sm font-semibold text-slate-200">Particulate Matter Comparison</h2>
            </div>
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickMargin={10} minTickGap={30} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="pm25" name="PM 2.5" stroke="#F43F5E" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pm10" name="PM 10" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Traffic vs AQI Scatter Plot */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col h-[400px] lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="text-violet-400 mr-2" size={18} />
                <h2 className="text-sm font-semibold text-slate-200">Traffic Density vs. AQI Correlation</h2>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md border border-indigo-500/20 font-bold tracking-wide uppercase">Live Analysis</span>
            </div>
            <div className="flex-1 w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="traffic" name="Vehicles/hr" stroke="#64748b" fontSize={11} label={{ value: 'Traffic Density (Vehicles)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                  <YAxis type="number" dataKey="aqi" name="AQI" stroke="#64748b" fontSize={11} label={{ value: 'Air Quality Index', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                  <ZAxis type="number" dataKey="z" range={[40, 100]} name="Volume" />
                  <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
                  <Scatter name="Zones" data={scatterData} fill="#8B5CF6" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      )}
    </motion.div>
  );
};

export default Analytics;
