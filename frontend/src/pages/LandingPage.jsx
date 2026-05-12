import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)]">
            <span className="font-bold text-white text-xl">E</span>
          </div>
          <span className="text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
            EcoTracker
          </span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-secondary text-sm px-6 py-2"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto w-full pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 mb-8 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-300">System v2.0 is now live</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6"
        >
          Decentralized <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-500 text-glow-cyan">
            Emission Intelligence
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-12"
        >
          Monitor, predict, and analyze urban pollution in real-time. Powered by advanced Machine Learning algorithms and secured via Blockchain technology.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6"
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2 group"
          >
            <span>Enter Dashboard</span>
            <motion.span 
              className="inline-block"
              groupHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              →
            </motion.span>
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <FeatureCard 
            icon={<Cpu size={24} className="text-sky-400" />}
            title="AI Predictions"
            desc="RandomForest-powered AQI forecasting with high accuracy."
          />
          <FeatureCard 
            icon={<ShieldCheck size={24} className="text-violet-400" />}
            title="Immutable Logs"
            desc="Hazardous data securely logged on the Ethereum blockchain."
          />
          <FeatureCard 
            icon={<Activity size={24} className="text-emerald-400" />}
            title="Real-Time Analytics"
            desc="Live socket streaming of urban emission data."
          />
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="glass-card p-6 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 border border-slate-700">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-slate-200 mb-2">{title}</h3>
    <p className="text-sm text-slate-400">{desc}</p>
  </div>
);

export default LandingPage;
