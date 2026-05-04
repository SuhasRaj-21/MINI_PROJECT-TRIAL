import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const Alerts = () => {
  const alerts = [
    { id: 1, type: 'critical', message: 'Hazardous AQI detected in Zone C. Logging to Blockchain.', time: '10 mins ago' },
    { id: 2, type: 'warning', message: 'Traffic building up in Zone B, expecting AQI rise.', time: '1 hour ago' },
    { id: 3, type: 'info', message: 'Zone A air quality returned to Good.', time: '2 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">System Alerts & Blockchain Logs</h1>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-4 rounded-xl border flex items-start space-x-4
            ${alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' : ''}
            ${alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' : ''}
            ${alert.type === 'info' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          `}>
            {alert.type === 'critical' || alert.type === 'warning' ? <AlertTriangle /> : <ShieldCheck />}
            <div className="flex-1">
              <p className="font-semibold">{alert.message}</p>
              <p className="text-sm opacity-75 mt-1">{alert.time}</p>
            </div>
            {alert.type === 'critical' && (
              <span className="bg-red-200 text-red-900 text-xs px-2 py-1 rounded-full font-bold">
                TX: 0x8a7b...
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;
