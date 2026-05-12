import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, TrendingUp, Route, Bell, BarChart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-64 border-r border-slate-800 bg-[#0F172A] flex flex-col h-full z-50 relative"
    >
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center">
            <span className="font-bold text-slate-900 text-sm leading-none">E</span>
          </div>
          <span className="text-[15px] font-semibold tracking-wide text-slate-200">
            EcoTracker
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Overview</p>
        <NavItem to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <NavItem to="/dashboard/map" icon={<Map size={18} />} label="Live Map" />
        <NavItem to="/dashboard/analytics" icon={<BarChart size={18} />} label="Analytics" />
        
        <div className="mt-6">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-6">Intelligence</p>
          <NavItem to="/dashboard/predict" icon={<TrendingUp size={18} />} label="AI Forecast" />
          <NavItem to="/dashboard/route" icon={<Route size={18} />} label="Smart Routes" />
        </div>

        <div className="mt-6">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 mt-6">System</p>
          <NavItem to="/dashboard/alerts" icon={<Bell size={18} />} label="Security Logs" />
          <NavItem to="/dashboard/settings" icon={<Settings size={18} />} label="Settings" disabled={true} />
        </div>
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 relative overflow-hidden">
          <div className="flex items-center space-x-2 mb-2 relative z-10">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h4 className="text-[13px] font-medium text-slate-300">System Normal</h4>
          </div>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden relative z-10">
            <div className="h-full w-full bg-slate-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const NavItem = ({ to, icon, label, disabled }) => {
  if (disabled) {
    return (
      <div className="flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 text-slate-600 opacity-50 cursor-not-allowed">
        <span>{icon}</span>
        <span className="font-medium text-sm">{label}</span>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 relative group ${
          isActive 
            ? 'text-slate-100 bg-slate-800/80 font-medium shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`${isActive ? 'text-slate-100' : 'group-hover:text-slate-200'} transition-colors`}>
            {icon}
          </span>
          <span className="font-medium text-[14px]">{label}</span>
        </>
      )}
    </NavLink>
  );
};

export default Sidebar;
