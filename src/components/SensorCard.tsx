'use client';

import React from 'react';
import Link from 'next/link';
import { SensorData } from '../types/dashboard';

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {

  // ✅ Konfigurasi range untuk setiap jenis sensor (sesuai dengan calculateStatus)
  const getSensorRange = (sensorName: string) => {
    const name = sensorName.toLowerCase();

    if (name.includes("soil") && name.includes("moisture")) {
      return { min: 0, max: 100 }; 
    } else if (name.includes("ec") && name.includes("soil")) {
      return { min: 0, max: 12 };
    } else if (name.includes("soil") && name.includes("ph")) {
      return { min: 0, max: 14 };
    } else if (name.includes("radiasi")) {
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
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 w-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-600 text-sm sm:text-base font-semibold">{sensor.name}</h3>
          <div className="text-2xl sm:text-3xl">{sensor.icon}</div>
        </div>

        <div className="mb-4">
          <p className="text-xl sm:text-2xl font-semibold text-gray-800">
            {sensor.value}
            {sensor.unit && <span className="text-base sm:text-lg ml-1">{sensor.unit}</span>}
          </p>
        </div>

        <div className="mb-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${sensor.color}`}
              style={{ width: `${calculateProgressPercentage(sensor.value, sensor.name)}%` }}
            />
          </div>
        </div>

        <div>
          <span className="text-sm sm:text-base text-gray-400 capitalize">
            {sensor.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SensorCard;
