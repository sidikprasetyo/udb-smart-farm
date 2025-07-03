'use client';

import React from 'react';
import Link from 'next/link';
import { SensorData } from '../types/dashboard';

interface SensorCardProps {
  sensor: SensorData;
}

const SensorCard: React.FC<SensorCardProps> = ({ sensor }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'text-green-500';
      case 'normal': return 'text-purple-500';
      case 'high': return 'text-red-500';
      case 'low': return 'text-yellow-600';
      case 'medium': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'normal': return 'bg-purple-500';
      case 'high': return 'bg-red-500';
      case 'low': return 'bg-yellow-500';
      case 'medium': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Link href={`/dashboard/${sensor.id}`} passHref>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 w-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-600 text-sm sm:text-base font-medium">{sensor.name}</h3>
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
              className={`h-2 rounded-full ${getProgressColor(sensor.status)}`}
              style={{ width: `${sensor.progress}%` }}
            />
          </div>
        </div>

        <div>
          <span className={`text-sm sm:text-base font-semibold capitalize ${getStatusColor(sensor.status)}`}>
            {sensor.status}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SensorCard;
