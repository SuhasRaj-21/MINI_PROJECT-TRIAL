import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 relative overflow-hidden flex flex-col font-sans">
      {/* Vercel/Linear style grid background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
      
      {/* Subtle top glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-sky-900/20 to-transparent pointer-events-none z-0 blur-3xl"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center shadow-sm">
            <span className="font-bold text-slate-900 text-lg leading-none">E</span>
          </div>
          <span className="text-[17px] font-semibold tracking-wide text-slate-100">
            EcoTracker
          </span>
        </div>
        <div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-cta text-sm px-5 py-2 rounded-md transition-all flex items-center"
          >
            Launch Platform
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto w-full pb-32 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-slate-800/50 border border-slate-700/50 rounded-full px-3 py-1.5 mb-8 shadow-sm backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-300 tracking-wide">System v2.0 is operational</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight text-white"
        >
          Decentralized <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
             Emission Intelligence
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 font-normal leading-relaxed"
        >
          Monitor, predict, and analyze urban pollution in real-time. Powered by advanced machine learning and secured via immutable blockchain technology.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-slate-100 text-slate-900 hover:bg-white text-md px-8 py-3 flex items-center justify-center space-x-2 rounded-lg font-semibold transition-colors"
          >
            <span>Start Exploring</span>
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => {}}
            className="bg-slate-800/50 text-slate-200 border border-slate-700 hover:bg-slate-800 text-md px-8 py-3 flex items-center justify-center rounded-lg font-medium transition-colors"
          >
            <span>Read the Docs</span>
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left"
        >
          <FeatureCard 
            icon={<Cpu size={20} className="text-sky-400" />}
            title="AI Predictions"
            desc="RandomForest-powered AQI forecasting with highly accurate simulation parameters."
          />
          <FeatureCard 
            icon={<ShieldCheck size={20} className="text-indigo-400" />}
            title="Immutable Logs"
            desc="Hazardous environmental data securely logged on the Ethereum blockchain."
          />
          <FeatureCard 
            icon={<Activity size={20} className="text-emerald-400" />}
            title="Real-Time Streams"
            desc="Live socket streaming of urban emission data for immediate operational response."
          />
        </motion.div>
      </main>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-[#1E293B]/50 border border-slate-800/80 p-6 rounded-xl hover:bg-[#1E293B] transition-colors">
    <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-5">
      {icon}
    </div>
    <h3 className="text-[15px] font-semibold text-slate-100 mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed font-normal">{desc}</p>
  </div>
);

export default LandingPage;
