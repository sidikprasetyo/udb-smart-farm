import React from "react";
import { DashboardData } from "../types/dashboard";
import SensorCard from "./SensorCard";
import CameraSnapshot from "./CameraSnapshot";

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Live Camera */}
      <div className="mb-6 lg:mb-8">
        <CameraSnapshot 
          title="Camera Snapshot"
          refreshInterval={5000}
          alt="ESP32 Camera Snapshot"
        />
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <SensorCard sensor={data.kelembaban_tanah} />
        <SensorCard sensor={data.kecepatan_angin} />
        <SensorCard sensor={data.kelembaban_udara} />
        <SensorCard sensor={data.nitrogen} />
        <SensorCard sensor={data.phosphorus} />
        <SensorCard sensor={data.kalium} />
        <SensorCard sensor={data.curah_hujan} />
        <SensorCard sensor={data.ec_tanah} />
        <SensorCard sensor={data.ph_tanah} />
        <SensorCard sensor={data.radiasi} />
        <SensorCard sensor={data.suhu_tanah} />
        <SensorCard sensor={data.suhu_udara} />
      </div>
    </div>
  );
};

export default Dashboard;
