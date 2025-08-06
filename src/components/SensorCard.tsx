"use client";

import React from "react";
import Link from "next/link";
import { SensorData } from "../types/dashboard";

interface SensorCardProps {
  sensor: SensorData;
  className?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor, className = "" }) => {
  // ✅ Konfigurasi range untuk setiap jenis sensor (sesuai dengan calculateStatus)
  const getSensorRange = (sensorName: string) => {
    const name = sensorName.toLowerCase();

    if (name.includes("soil") && name.includes("moisture")) {
      return { min: 0, max: 100 };
    } else if (name.includes("ec") && name.includes("soil")) {
      return { min: 0, max: 4000 };
    } else if (name.includes("soil") && name.includes("ph")) {
      return { min: 0, max: 14 };
    } else if (name.includes("radiation")) {
      return { min: 0, max: 1200 };
    } else if (name.includes("soil") && name.includes("temperature")) {
      return { min: 0, max: 50 };
    } else if (name.includes("air") && name.includes("temperature")) {
      return { min: 0, max: 50 };
    } else if (name.includes("air") && name.includes("humidity")) {
      return { min: 0, max: 100 };
    } else if (name.includes("wind") && name.includes("speed")) {
      return { min: 0, max: 25 };
    } else if (name.includes("rainfall")) {
      return { min: 0, max: 150 };
    } else if (name.includes("nitrogen")) {
      return { min: 0, max: 200 };
    } else if (name.includes("phosphorus")) {
      return { min: 0, max: 60 };
    } else if (name.includes("potassium")) {
      return { min: 0, max: 300 };
    } else {
      // Default range jika sensor tidak dikenali
      return { min: 0, max: 100 };
    }
  };

  // ✅ Function untuk mengkonversi nilai sensor ke persentase
  const calculateProgressPercentage = (value: string | number, sensorName: string) => {
    const numericValue = typeof value === "number" ? value : parseFloat(value);

    // Jika nilai bukan angka, return 0
    if (isNaN(numericValue)) return 0;

    const range = getSensorRange(sensorName);

    // Konversi nilai ke persentase berdasarkan range
    let percentage = ((numericValue - range.min) / (range.max - range.min)) * 100;

    // Pastikan persentase dalam range 0-100
    percentage = Math.max(0, Math.min(100, percentage));

    return percentage;
  };

  return (
    <Link href={`/dashboard/${sensor.id}`} passHref>
      <div className={`relative bg-white rounded-xl shadow-md hover:shadow-lg card-hover overflow-hidden group cursor-pointer ${className}`}>
        {/* Header Row */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="text-xl sm:text-2xl flex-shrink-0">{sensor.icon}</div>
              <h3 className="text-gray-700 text-sm sm:text-base font-semibold truncate">{sensor.name}</h3>
            </div>

            {/* Status Indicator */}
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${sensor.status === "normal" ? "bg-green-400" : sensor.status === "low" ? "bg-yellow-400" : sensor.status === "high" ? "bg-red-400" : "bg-gray-400"}`} />
          </div>
        </div>

        {/* Value Row */}
        <div className="px-4 pb-4">
          <div className="mb-3">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{sensor.value}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className={`h-2 rounded-full transition-all duration-500 ${sensor.color} group-hover:opacity-80`} style={{ width: `${calculateProgressPercentage(sensor.value, sensor.name)}%` }} />
            </div>
          </div>

          {/* Status and Details */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs sm:text-sm font-medium capitalize px-2 py-1 rounded-full ${
                sensor.status === "normal" ? "bg-green-100 text-green-700" : sensor.status === "low" ? "bg-yellow-100 text-yellow-700" : sensor.status === "high" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
              }`}
            >
              {sensor.status}
            </span>

            {/* Arrow indicator */}
            <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
      </div>
    </Link>
  );
};

export default SensorCard;
