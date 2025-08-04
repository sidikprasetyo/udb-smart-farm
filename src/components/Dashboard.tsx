import React from "react";
import { DashboardData } from "../types/dashboard";
import SensorCard from "./SensorCard";
import CameraSnapshot from "./CameraSnapshot";

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Organize sensors into logical groups for better layout
  const sensorGroups = [
    {
      title: "Soil Monitoring",
      sensors: [data.kelembaban_tanah, data.suhu_tanah, data.ec_tanah, data.ph_tanah],
    },
    {
      title: "Air & Weather",
      sensors: [data.suhu_udara, data.kelembaban_udara, data.kecepatan_angin, data.curah_hujan],
    },
    {
      title: "Nutrients & Environment",
      sensors: [data.nitrogen, data.phosphorus, data.kalium, data.radiasi],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Live Camera */}
      <div className="mb-6 lg:mb-8">
        <CameraSnapshot title="Camera Snapshot" refreshInterval={5000} alt="ESP32 Camera Snapshot" />
      </div>

      {/* Sensor Groups */}
      <div className="space-y-8">
        {sensorGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            {/* Group Title */}
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{group.title}</h2>
              <div className="flex-1 ml-4 border-t border-gray-300"></div>
            </div>

            {/* Sensor Cards Grid - 2 rows responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
              {group.sensors.map((sensor) => (
                <SensorCard key={sensor.id} sensor={sensor} className="hover:scale-105 transition-transform duration-200" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Stats Section */}
      <div className="mt-8 p-6 bg-white rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Object.values(data).filter((sensor) => typeof sensor === "object" && sensor.status === "normal").length}</div>
            <div className="text-sm text-green-600">Normal</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{Object.values(data).filter((sensor) => typeof sensor === "object" && (sensor.status === "low" || sensor.status === "high")).length}</div>
            <div className="text-sm text-yellow-600">Warning</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-sm text-blue-600">Total Sensors</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{data.waktu ? new Date(data.waktu).toLocaleTimeString() : "--:--"}</div>
            <div className="text-sm text-gray-600">Last Update</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
