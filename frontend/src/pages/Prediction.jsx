import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Activity, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Prediction = () => {
  const [formData, setFormData] = useState({
    pm25: 45.0,
    pm10: 80.0,
    no2: 25.0,
    co: 1.5,
    temperature: 28.0,
    humidity: 60.0,
    vehicle_count: 120,
    speed: 40.0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Prediction failed');
      }

      const data = await response.json();
      setPredictionResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const labels = ['Now', '+1h', '+3h', '+6h', '+12h', '+24h'];
  
  let chartData = [65, 70, 75, 80, 95, 110]; // default
  if (predictionResult) {
     const base = predictionResult.aqi_1hr;
     const max = predictionResult.aqi_24hr;
     chartData = [
       base, 
       base + (max-base)*0.2, 
       base + (max-base)*0.4, 
       base + (max-base)*0.6, 
       base + (max-base)*0.8, 
       max
     ];
  }

  const data = {
    labels,
    datasets: [
      {
        label: 'Predicted AQI Trend',
        data: chartData,
        borderColor: 'rgba(56, 189, 248, 1)',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#0F172A',
        pointBorderColor: 'rgba(56, 189, 248, 1)',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#F8FAFC',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(56, 189, 248, 0.3)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  const getRiskIcon = (risk) => {
    if (!risk) return <Activity className="text-sky-400" />;
    if (risk.includes("Good") || risk.includes("Moderate")) return <CheckCircle2 className="text-emerald-400" size={32} />;
    return <ShieldAlert className="text-rose-400 animate-pulse" size={32} />;
  };

  const getRiskColor = (risk) => {
    if (!risk) return "text-slate-400";
    if (risk.includes("Good")) return "text-emerald-400";
    if (risk.includes("Moderate")) return "text-amber-400";
    if (risk.includes("Unhealthy") || risk.includes("Hazardous")) return "text-rose-400 text-glow-violet";
    return "text-slate-400";
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">AI Forecasting Engine</h1>
          <p className="text-slate-400 mt-1">Simulate environmental scenarios using our RandomForest model.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 lg:col-span-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center">
            <Activity size={18} className="mr-2 text-violet-400" />
            Simulation Parameters
          </h2>
          
          <form onSubmit={handlePredict} className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'PM 2.5', name: 'pm25', step: '0.1' },
                { label: 'PM 10', name: 'pm10', step: '0.1' },
                { label: 'NO2', name: 'no2', step: '0.1' },
                { label: 'CO', name: 'co', step: '0.1' },
                { label: 'Temp (°C)', name: 'temperature', step: '0.1' },
                { label: 'Humidity %', name: 'humidity', step: '0.1' },
                { label: 'Vehicles/Hr', name: 'vehicle_count', step: '1' },
                { label: 'Avg Speed', name: 'speed', step: '0.1' }
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{field.label}</label>
                  <input 
                    type="number" 
                    step={field.step} 
                    name={field.name} 
                    value={formData[field.name]} 
                    onChange={handleInputChange} 
                    className="input-premium w-full px-3 py-2 text-sm" 
                  />
                </div>
              ))}
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                loading 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-sky-500 to-violet-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Generate Prediction
                  <ChevronRight size={18} className="ml-1" />
                </>
              )}
            </button>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-sm">
                {error}
              </motion.div>
            )}
          </form>
        </motion.div>

        {/* Results & Chart */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Result Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`glass-card p-6 relative overflow-hidden transition-all duration-500 ${predictionResult ? 'border-sky-500/30 shadow-[0_0_30px_rgba(56,189,248,0.1)]' : ''}`}
          >
            {predictionResult && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
            )}
            <h2 className="text-lg font-semibold text-slate-100 mb-6">Inference Result</h2>
            
            {predictionResult ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 relative z-10">
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Predicted AQI (1Hr)</p>
                  <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 mb-2">
                    {predictionResult.aqi_1hr}
                  </div>
                  <p className="text-sm text-slate-500">Projected 24hr Peak: <span className="text-slate-300 font-semibold">{predictionResult.aqi_24hr}</span></p>
                </div>
                
                <div className="flex-1 flex flex-col items-center sm:items-end justify-center">
                  <div className="flex items-center space-x-3 mb-2">
                    {getRiskIcon(predictionResult.risk_level)}
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-1">Risk Assessment</p>
                      <p className={`text-xl font-bold uppercase tracking-wider ${getRiskColor(predictionResult.risk_level)}`}>
                        {predictionResult.risk_level}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-xl">
                Enter parameters and run simulation to view results
              </div>
            )}
          </motion.div>

          {/* Chart Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 h-[400px] flex flex-col"
          >
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Trajectory Forecast</h2>
            <div className="flex-1 relative w-full h-full">
              <Line options={options} data={data} />
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Prediction;
