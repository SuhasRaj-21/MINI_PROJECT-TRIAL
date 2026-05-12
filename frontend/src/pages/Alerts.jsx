import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Info, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLivePollution, socket } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Helper to transform raw pollution data to an alert object
    const mapToAlert = (data) => {
      let type = 'info';
      let message = `${data.zone} air quality is stable (AQI: ${Math.round(data.aqi)}).`;
      let tx = null;

      if (data.aqi > 150 || data.risk_level === 'Hazardous' || data.risk_level === 'Very Unhealthy') {
        type = 'critical';
        message = `Hazardous AQI (${Math.round(data.aqi)}) detected in ${data.zone}. Logged to Blockchain.`;
        // Generate a deterministic mock TX hash based on ID or timestamp for demonstration
        tx = `0x${Math.abs(hashString(data._id || data.timestamp.toString())).toString(16)}...f4d2`;
      } else if (data.aqi > 100 || data.risk_level === 'Unhealthy for Sensitive Groups' || data.risk_level === 'Unhealthy') {
        type = 'warning';
        message = `Pollution levels rising in ${data.zone} (AQI: ${Math.round(data.aqi)}). Proceed with caution.`;
      }

      return {
        id: data._id || Math.random().toString(),
        type,
        message,
        time: new Date(data.timestamp).toLocaleString(),
        tx
      };
    };

    // Simple string hasher for mock TX
    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash;
    };

    fetchLivePollution().then((data) => {
      const generatedAlerts = data.map(mapToAlert);
      setAlerts(generatedAlerts);
    }).catch(console.error);

    socket.on('newData', (newRecord) => {
      const newAlert = mapToAlert(newRecord);
      setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
    });

    return () => socket.off('newData');
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-10 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
            <ShieldCheck className="mr-3 text-violet-400" size={32} />
            Security & System Logs
          </h1>
          <p className="text-slate-400 mt-1">Immutable blockchain transactions and real-time system alerts.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4 relative"
      >
        {/* Timeline line */}
        <div className="absolute left-[27px] top-4 bottom-4 w-px bg-slate-700/50 hidden md:block"></div>

        {alerts.length > 0 ? alerts.map((alert) => {
          let styles = '';
          let icon = null;
          let glow = '';

          if (alert.type === 'critical') {
            styles = 'bg-rose-500/10 border-rose-500/30 text-rose-300';
            icon = <AlertTriangle className="text-rose-400" size={24} />;
            glow = 'shadow-[0_0_20px_rgba(244,63,94,0.15)]';
          } else if (alert.type === 'warning') {
            styles = 'bg-amber-500/10 border-amber-500/30 text-amber-300';
            icon = <AlertTriangle className="text-amber-400" size={24} />;
            glow = 'shadow-[0_0_20px_rgba(245,158,11,0.1)]';
          } else {
            styles = 'bg-sky-500/10 border-sky-500/30 text-sky-300';
            icon = <Info className="text-sky-400" size={24} />;
            glow = 'shadow-[0_0_20px_rgba(56,189,248,0.1)]';
          }

          return (
            <motion.div 
              key={alert.id} 
              variants={itemVariants}
              className={`p-5 rounded-2xl border backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6 relative z-10 hover:-translate-y-1 transition-all duration-300 ${styles} ${glow}`}
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-900/50 flex items-center justify-center border border-slate-700/50 z-10">
                {icon}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold text-slate-200 text-lg">{alert.message}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-sm text-slate-400 font-medium">{alert.time}</span>
                  {alert.type === 'critical' && alert.tx && (
                    <span className="flex items-center space-x-1 text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2 py-1 rounded-md">
                      <LinkIcon size={12} />
                      <span>Immutable</span>
                    </span>
                  )}
                </div>
              </div>

              {alert.tx && (
                <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-full md:w-auto px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 transition-colors text-sm font-mono text-slate-300 hover:text-sky-400 group"
                  >
                    <span className="mr-2">TX: {alert.tx}</span>
                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
            </motion.div>
          );
        }) : (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-2xl">
            <div className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Fetching real-time blockchain logs and alerts...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Alerts;
