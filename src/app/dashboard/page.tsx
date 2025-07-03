"use client";

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';
import { DashboardData, SensorData } from '@/types/dashboard';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/lib/firebaseConfig';

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    soilMoisture: {
      id: 'soil-moisture',
      name: 'Soil Moisture',
      value: 'Loading...',
      status: 'normal',
      icon: '💧',
      progress: 0
    },
    soilPH: {
      id: 'soil-ph',
      name: 'Soil PH',
      value: 'Loading...',
      status: 'normal',
      icon: '🧪',
      progress: 0
    },
    windSpeed: {
      id: 'wind-speed',
      name: 'Wind Speed',
      value: 'Loading...',
      status: 'normal',
      icon: '💨',
      progress: 0
    },
    rainfall: {
      id: 'rainfall',
      name: 'Rainfall',
      value: 'Loading...',
      status: 'normal',
      icon: '🌧️',
      progress: 0
    },
    radiation: {
      id: 'radiation',
      name: 'Radiation',
      value: 'Loading...',
      status: 'normal',
      icon: '☀️',
      progress: 0
    },
    soilTemperature: {
      id: 'soil-temp',
      name: 'Soil Temperature',
      value: 'Loading...',
      status: 'normal',
      icon: '🌡️',
      progress: 0
    },
    dhtTemperature: {
      id: 'dht-temp',
      name: 'DHT Temperature',
      value: 'Loading...',
      status: 'normal',
      icon: '🔥',
      progress: 0
    },
    dhtHumidity: {
      id: 'dht-humidity',
      name: 'DHT Humidity',
      value: 'Loading...',
      status: 'normal',
      icon: '💧',
      progress: 0
    }
  });

  useEffect(() => {
    const sensorsMap: Record<string, keyof DashboardData> = {
      soil_moisture: 'soilMoisture',
      soil_ph: 'soilPH',
      wind_speed: 'windSpeed',
      rainfall: 'rainfall',
      radiation: 'radiation',
      temperature: 'soilTemperature',
      dht_temperature: 'dhtTemperature',
      dht_humidity: 'dhtHumidity',
    };

    const defaultIcons: { [key in keyof DashboardData]: string } = {
      soilMoisture: '💧',
      soilPH: '🧪',
      windSpeed: '💨',
      rainfall: '🌧️',
      radiation: '☀️',
      soilTemperature: '🌡️',
      dhtTemperature: '🔥',
      dhtHumidity: '💧',
    };

    const units: { [key in keyof DashboardData]: string } = {
      soilMoisture: '%',
      soilPH: '',
      windSpeed: 'm/s',
      rainfall: 'mm',
      radiation: 'W/m²',
      soilTemperature: '°C',
      dhtTemperature: '°C',
      dhtHumidity: '%',
    };

    const calculateStatus = (key: string, value: number): SensorData['status'] => {
      switch (key) {
        case 'soilMoisture':
          return value >= 60 ? 'optimal' : value >= 40 ? 'normal' : 'low';
        case 'soilPH':
          return value >= 6 && value <= 7.5 ? 'normal' : 'high';
        case 'radiation':
          return value > 5 ? 'high' : 'normal';
        case 'soilTemperature':
        case 'dhtTemperature':
          return value > 30 ? 'high' : value >= 20 ? 'normal' : 'low';
        case 'dhtHumidity':
          return value >= 60 ? 'normal' : 'low';
        case 'windSpeed':
          return value > 20 ? 'high' : 'normal';
        case 'rainfall':
          return value > 10 ? 'high' : value > 5 ? 'medium' : 'low';
        default:
          return 'normal';
      }
    };

    const listeners: { ref: ReturnType<typeof ref>; callback: any }[] = [];

    Object.entries(sensorsMap).forEach(([firebaseKey, dashboardKey]) => {
      const sensorRef = ref(database, `sensor/${firebaseKey}`);

      const callback = (snapshot: any) => {
        const rawValue = snapshot.val();
        if (rawValue != null && !isNaN(parseFloat(rawValue))) {
          const value = parseFloat(rawValue);
          const unit = units[dashboardKey];
          const status = calculateStatus(dashboardKey, value);
          const progress = Math.min(Math.max(Math.round(value), 0), 100);

          setDashboardData((prevData) => ({
            ...prevData,
            [dashboardKey]: {
              id: dashboardKey,
              name: dashboardKey.replace(/([A-Z])/g, ' $1'),
              value: unit ? `${value}${unit}` : value,
              // unit: unit || '',
              status,
              icon: defaultIcons[dashboardKey],
              progress,
            },
          }));
        }
      };

      onValue(sensorRef, callback);
      listeners.push({ ref: sensorRef, callback });
    });

    // Cleanup function
    return () => {
      listeners.forEach(({ ref, callback }) => {
        off(ref, 'value', callback);
      });
    };
  }, []);

  return (
    <>
      <Head>
        <title>Smart Farm Dashboard</title>
        <meta name="description" content="IoT Smart Farm Monitoring Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentPage="dashboard" />

        <div className="flex-1">
          <Header title="Dashboard" userName="Admin" />
          <Dashboard data={dashboardData} />
        </div>
      </div>
    </>
  );
};

export default Home;
