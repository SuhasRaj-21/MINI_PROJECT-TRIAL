import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Chatbot from './Chatbot';

const Layout = () => {
  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-200 overflow-hidden relative">
      {/* Very subtle top gradient for depth, not glowing */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#1E293B]/20 to-transparent pointer-events-none z-0"></div>
      
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden z-10 relative">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8 relative z-10">
          <Outlet />
        </main>
      </div>

      <Chatbot />
    </div>
  );
};

export default Layout;
