import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.div 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-20 border-b border-white/5 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40"
    >
      <div className="flex items-center bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 w-96 transition-all focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500">
        <Search size={18} className="text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search analytics, zones..." 
          className="bg-transparent border-none outline-none text-slate-200 text-sm w-full placeholder-slate-500"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-colors">
          <Bell size={20} className="text-slate-300" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-700 pl-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-200">Admin User</p>
            <p className="text-xs text-sky-400">Premium Plan</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-500 to-violet-500 p-[2px]">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
               <User size={18} className="text-slate-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
