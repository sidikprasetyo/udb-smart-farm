import React from 'react';

const SensorGraph: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 w-2/3">
      <h2 className="text-xl font-bold text-center mb-2 capitalize">{title}</h2>
      <p className="text-center text-gray-600 mb-4">Grafik Garis</p>
      <div className="w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        Grafik akan ditampilkan di sini
      </div>
    </div>
  );
};

export default SensorGraph;
