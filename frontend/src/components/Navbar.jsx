import React from 'react';
import { Bell, Search, Command } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40"
    >
      <button className="flex items-center bg-[#1E293B] hover:bg-[#243041] border border-slate-700/80 rounded-lg px-3 py-1.5 w-64 lg:w-96 transition-all shadow-sm group">
        <Search size={14} className="text-slate-400 mr-2 group-hover:text-slate-300" />
        <span className="text-slate-400 text-[13px] flex-1 text-left group-hover:text-slate-300 transition-colors">Search platform...</span>
        <div className="hidden sm:flex items-center space-x-1 text-slate-500 bg-[#0F172A] px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-700/50">
          <Command size={10} />
          <span>K</span>
        </div>
      </button>

      <div className="flex items-center space-x-4">
        <button className="relative p-1.5 rounded-md hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200">
          <Bell size={18} />
          <span className="absolute top-1 right-1.5 w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-[13px] font-medium text-slate-200 leading-tight">Admin User</p>
            <p className="text-[11px] text-slate-500 font-medium">EcoTracker Pro</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
             <div className="w-full h-full bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
               A
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
