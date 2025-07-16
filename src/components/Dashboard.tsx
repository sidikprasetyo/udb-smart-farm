import React from "react";
import { DashboardData } from "../types/dashboard";
import LiveCamera from "./LiveCamera";
import SensorCard from "./SensorCard";

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Live Camera */}
      <div className="mb-6 lg:mb-8">
        <LiveCamera />
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <SensorCard sensor={data.kelembaban_tanah} />
        <SensorCard sensor={data.ph_tanah} />
        <SensorCard sensor={data.kecepatan_angin} />
        <SensorCard sensor={data.curah_hujan} />
        <SensorCard sensor={data.radiasi} />
        <SensorCard sensor={data.suhu} />
        <SensorCard sensor={data.dht_humidity} />
        <SensorCard sensor={data.dht_temperature} />
        <SensorCard sensor={data.natrium} />
        <SensorCard sensor={data.fosfor} />
        <SensorCard sensor={data.kalium} />
      </div>
    </div>
  );
};

export default Dashboard;
