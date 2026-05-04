import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Prediction from './pages/Prediction';
import RoutePlanner from './pages/RoutePlanner';
import Alerts from './pages/Alerts';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-transparent">
        <Sidebar />
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/map" element={<LiveMap />} />
              <Route path="/predict" element={<Prediction />} />
              <Route path="/route" element={<RoutePlanner />} />
              <Route path="/alerts" element={<Alerts />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
