import React from 'react';
import { DashboardData } from '../types/dashboard';
import LiveCamera from './LiveCamera';
import SensorCard from './SensorCard';

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <LiveCamera />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SensorCard sensor={data.soilMoisture} />
        <SensorCard sensor={data.soilPH} />
        <SensorCard sensor={data.windSpeed} />
        <SensorCard sensor={data.rainfall} />
        <SensorCard sensor={data.radiation} />
        <SensorCard sensor={data.soilTemperature} />
        <SensorCard sensor={data.dhtTemperature} />
        <SensorCard sensor={data.dhtHumidity} />
      </div>
    </div>
  );
};

export default Dashboard;