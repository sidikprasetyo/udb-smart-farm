import React, { useState, useEffect } from "react";
import { DashboardData } from "../types/dashboard";
import SensorCard from "./SensorCard";
import CameraSnapshot from "./CameraSnapshot";

interface DashboardProps {
  data: DashboardData;
  lastUpdateTimestamp?: number | null;
  isConnected?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, lastUpdateTimestamp, isConnected = true }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for relative time display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate time ago
  const getTimeAgo = (timestamp: number | null) => {
    if (!timestamp) return "--:--";

    const now = currentTime.getTime();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 5) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return "--:--:--";
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get connection status color and text
  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        color: "text-red-600",
        bgColor: "bg-red-500",
        text: "Disconnected",
      };
    }

    // Check if timestamp is recent (within last 30 seconds)
    const timeDiff = lastUpdateTimestamp ? (Date.now() - lastUpdateTimestamp) / 1000 : Infinity;
    if (timeDiff > 30) {
      return {
        color: "text-orange-600",
        bgColor: "bg-orange-500",
        text: "Stale Data",
      };
    }

    return {
      color: "text-green-600",
      bgColor: "bg-green-500",
      text: "Live",
    };
  };

  const connectionStatus = getConnectionStatus();
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
          <div className="text-center p-4 bg-gray-50 rounded-lg relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.bgColor} ${isConnected ? 'animate-pulse' : ''}`}></div>
              <div className="text-lg font-bold text-gray-600">{formatTimestamp(lastUpdateTimestamp ?? null)}</div>
            </div>
            <div className="text-xs text-gray-500 mb-1">{getTimeAgo(lastUpdateTimestamp ?? null)}</div>
            <div className="text-sm text-gray-600 mb-1">Last Update</div>
            <div className={`text-xs ${connectionStatus.color} font-medium`}>
              {connectionStatus.text}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
