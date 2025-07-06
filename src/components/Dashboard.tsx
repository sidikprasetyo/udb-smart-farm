import React from 'react';
import { DashboardData } from '../types/dashboard';
import LiveCamera from './LiveCamera';
import SensorCard from './SensorCard';

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-gray-50 min-h-screen">
      {/* Live Camera */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <LiveCamera />
      </div>
      
      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
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