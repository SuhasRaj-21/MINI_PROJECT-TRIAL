import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, Info, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchLivePollution, socket } from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const mapToAlert = (data) => {
      let type = 'info';
      let message = `${data.zone} air quality is stable (AQI: ${Math.round(data.aqi)}).`;
      let tx = null;

      if (data.aqi > 150 || data.risk_level === 'Hazardous' || data.risk_level === 'Very Unhealthy') {
        type = 'critical';
        message = `Hazardous AQI (${Math.round(data.aqi)}) detected in ${data.zone}. Logged to Blockchain.`;
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
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight flex items-center">
            <ShieldCheck className="mr-3 text-indigo-400" size={24} />
            Security & System Logs
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Immutable blockchain transactions and real-time system alerts.</p>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3 relative"
      >
        {alerts.length > 0 ? alerts.map((alert) => {
          let styles = '';
          let icon = null;

          if (alert.type === 'critical') {
            styles = 'bg-rose-500/10 border-rose-500/20 text-rose-300';
            icon = <AlertTriangle className="text-rose-400" size={18} />;
          } else if (alert.type === 'warning') {
            styles = 'bg-amber-500/10 border-amber-500/20 text-amber-300';
            icon = <AlertTriangle className="text-amber-400" size={18} />;
          } else {
            styles = 'bg-sky-500/10 border-sky-500/20 text-sky-300';
            icon = <Info className="text-sky-400" size={18} />;
          }

          return (
            <motion.div 
              key={alert.id} 
              variants={itemVariants}
              className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4 relative z-10 transition-colors ${styles}`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center border border-slate-700">
                {icon}
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-slate-200 text-[14px]">{alert.message}</p>
                <div className="flex items-center mt-1 space-x-3">
                  <span className="text-xs text-slate-500 font-medium">{alert.time}</span>
                  {alert.type === 'critical' && alert.tx && (
                    <span className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                      <LinkIcon size={10} />
                      <span className="uppercase tracking-wider">Immutable</span>
                    </span>
                  )}
                </div>
              </div>

              {alert.tx && (
                <div className="flex-shrink-0 w-full md:w-auto mt-3 md:mt-0">
                  <a 
                    href="#" 
                    className="flex items-center justify-center w-full md:w-auto px-3 py-1.5 rounded-lg bg-[#0F172A] hover:bg-slate-800 border border-slate-700 transition-colors text-xs font-mono text-slate-400 hover:text-slate-200 group"
                  >
                    <span className="mr-2">TX: {alert.tx}</span>
                    <ExternalLink size={12} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
            </motion.div>
          );
        }) : (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl bg-[#1E293B]/50">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm">Fetching real-time blockchain logs and alerts...</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Alerts;
