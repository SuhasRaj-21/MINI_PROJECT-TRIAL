import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, TrendingUp, Route, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 border-r border-white/5 bg-slate-900/80 backdrop-blur-xl flex flex-col h-full z-50 relative"
    >
      <div className="h-20 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <span className="font-bold text-white text-lg leading-none">E</span>
          </div>
          <span className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
            EcoTracker
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Main Menu</p>
        <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
        <NavItem to="/dashboard/map" icon={<Map size={20} />} label="Live Map" />
        <NavItem to="/dashboard/predict" icon={<TrendingUp size={20} />} label="AI Prediction" />
        <NavItem to="/dashboard/route" icon={<Route size={20} />} label="Route Planner" />
        <NavItem to="/dashboard/alerts" icon={<Bell size={20} />} label="Alerts & Logs" />
      </div>

      <div className="p-4 border-t border-white/5">
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-900/40 to-violet-900/40 border border-sky-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/20 rounded-full blur-2xl"></div>
          <h4 className="text-sm font-semibold text-white mb-1 relative z-10">System Status</h4>
          <p className="text-xs text-sky-200 relative z-10">All nodes operational</p>
          <div className="mt-3 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5 }}
              className="h-full bg-gradient-to-r from-sky-400 to-violet-500"
            ></motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    end={to === "/dashboard"}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
        isActive 
          ? 'text-white bg-slate-800/80 border border-slate-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div 
            layoutId="active-nav"
            className="absolute left-0 top-0 w-1 h-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
          />
        )}
        <span className={`${isActive ? 'text-sky-400' : 'group-hover:text-sky-400'} transition-colors`}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </>
    )}
  </NavLink>
);

export default Sidebar;
