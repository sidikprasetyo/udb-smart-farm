'use client';

import React from 'react';
import Link from 'next/link';
import { SensorData } from '../types/dashboard';

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {

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
              style={{ width: `${sensor.progress}%` }}
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
