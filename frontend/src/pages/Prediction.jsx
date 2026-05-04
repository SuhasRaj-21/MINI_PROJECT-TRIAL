import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Prediction = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'AQI Trend (Next 24 Hours)' },
    },
  };

  const labels = ['Now', '+1h', '+3h', '+6h', '+12h', '+24h'];
  const data = {
    labels,
    datasets: [
      {
        label: 'Predicted AQI',
        data: [65, 70, 75, 80, 95, 110],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.4
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">AI Prediction & Trends</h1>
      {/* Add interactive buttons */}
      <div className="flex space-x-4 mb-6">
        <button className="btn-primary px-6 py-2 rounded-xl">24 Hour Forecast</button>
        <button className="btn-secondary px-6 py-2 rounded-xl">7 Day Trend</button>
      </div>
      <div className="glass-card p-6 rounded-xl shadow-sm border border-gray-100">
        <Line options={options} data={data} />
      </div>
      <div className="glass-card p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
         <h2 className="text-xl font-semibold mb-4">Insights</h2>
         <ul className="list-disc pl-5 space-y-2 text-gray-700">
            <li>Pollution is expected to peak at +24h due to rush hour traffic.</li>
            <li>Recommended to limit outdoor activities tomorrow morning.</li>
         </ul>
      </div>
    </div>
  );
};

export default Prediction;
