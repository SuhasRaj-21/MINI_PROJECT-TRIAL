import { NavLink } from 'react-router-dom';
import { Home, Map, TrendingUp, Route, Bell } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="glass-panel flex flex-col w-64 bg-gray-900 text-white shadow-xl">
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-sky-400">EcoTracker</h1>
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-2">
        <NavItem to="/" icon={<Home size={20} />} label="Dashboard" />
        <NavItem to="/map" icon={<Map size={20} />} label="Live Map" />
        <NavItem to="/predict" icon={<TrendingUp size={20} />} label="AI Prediction" />
        <NavItem to="/route" icon={<Route size={20} />} label="Route Planner" />
        <NavItem to="/alerts" icon={<Bell size={20} />} label="Alerts & Logs" />
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-white/10 text-white border-l-4 border-sky-400' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`
    }
  >
    {icon}
    <span className="font-medium">{label}</span>
  </NavLink>
);

export default Sidebar;
