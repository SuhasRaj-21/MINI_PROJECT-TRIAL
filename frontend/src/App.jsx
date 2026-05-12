import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import LiveMap from './pages/LiveMap';
import Prediction from './pages/Prediction';
import RoutePlanner from './pages/RoutePlanner';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<LiveMap />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="predict" element={<Prediction />} />
          <Route path="route" element={<RoutePlanner />} />
          <Route path="alerts" element={<Alerts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
