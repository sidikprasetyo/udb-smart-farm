import React from "react";
import { DashboardData } from "../types/dashboard";
import LiveCamera from "./LiveCamera";
import SensorCard from "./SensorCard";

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Camera Section */}
      <div className="mb-6">
        <LiveCamera />
      </div>

      {/* Sensor Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
