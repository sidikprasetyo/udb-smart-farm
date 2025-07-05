"use client";

import React, { useState, useEffect, JSX } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardData, SensorData } from "@/types/dashboard";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import { WiHumidity, WiRaindrops, WiStrongWind, WiSolarEclipse, WiThermometer } from "react-icons/wi";
import { MdOpacity, MdDeviceThermostat } from "react-icons/md";
import { SlChemistry } from "react-icons/sl";

const Home: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    soilMoisture: {
      id: "soil-moisture",
      name: "Soil Moisture",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    soilPH: {
      id: "soil-ph",
      name: "Soil PH",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    windSpeed: {
      id: "wind-speed",
      name: "Wind Speed",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    rainfall: {
      id: "rainfall",
      name: "Rainfall",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    radiation: {
      id: "radiation",
      name: "Radiation",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    soilTemperature: {
      id: "soil-temp",
      name: "Soil Temperature",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    dhtTemperature: {
      id: "dht-temp",
      name: "DHT Temperature",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    dhtHumidity: {
      id: "dht-humidity",
      name: "DHT Humidity",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
  });

  useEffect(() => {
    const sensorsMap: Record<string, keyof DashboardData> = {
      kelembaban_tanah: "soilMoisture",
      ph_tanah: "soilPH",
      kecepatan_angin: "windSpeed",
      curah_hujan: "rainfall",
      radiasi: "radiation",
      suhu: "soilTemperature",
      dht_temperature: "dhtTemperature",
      dht_humidity: "dhtHumidity",
    };

    const defaultColors: { [key in keyof DashboardData]: string } = {
      soilMoisture: "bg-green-600",
      soilPH: "bg-purple-500",
      windSpeed: "bg-blue-400",
      rainfall: "bg-blue-600",
      radiation: "bg-yellow-500",
      soilTemperature: "bg-red-500",
      dhtTemperature: "bg-orange-500",
      dhtHumidity: "bg-cyan-500",
    };

    const defaultIcons: { [key in keyof DashboardData]: JSX.Element } = {
      soilMoisture: <MdOpacity className="w-7 h-7 text-green-600" />,
      soilPH: <SlChemistry className="w-7 h-7 text-purple-500" />,
      windSpeed: <WiStrongWind className="w-7 h-7 text-blue-400" />,
      rainfall: <WiRaindrops className="w-7 h-7 text-blue-600" />,
      radiation: <WiSolarEclipse className="w-7 h-7 text-yellow-500" />,
      soilTemperature: <WiThermometer className="w-7 h-7 text-red-500" />,
      dhtTemperature: <MdDeviceThermostat className="w-7 h-7 text-orange-500" />,
      dhtHumidity: <WiHumidity className="w-7 h-7 text-cyan-500" />,
    };

    const units: { [key in keyof DashboardData]: string } = {
      soilMoisture: "%",
      soilPH: "",
      windSpeed: "m/s",
      rainfall: "mm",
      radiation: "W/m²",
      soilTemperature: "°C",
      dhtTemperature: "°C",
      dhtHumidity: "%",
    };

    const labelNames: { [key in keyof DashboardData]: string } = {
      soilMoisture: "Soil Moisture",
      soilPH: "Soil PH",
      windSpeed: "Wind Speed",
      rainfall: "Rainfall",
      radiation: "Radiation",
      soilTemperature: "Soil Temperature",
      dhtTemperature: "DHT Temperature",
      dhtHumidity: "DHT Humidity",
    };

    const calculateStatus = (key: string, value: number): SensorData["status"] => {
      switch (key) {
        case "soilMoisture":
          return value >= 60 ? "optimal" : value >= 40 ? "normal" : "low";
        case "soilPH":
          return value >= 6 && value <= 7.5 ? "normal" : "high";
        case "radiation":
          return value > 5 ? "high" : "normal";
        case "soilTemperature":
        case "dhtTemperature":
          return value > 30 ? "high" : value >= 20 ? "normal" : "low";
        case "dhtHumidity":
          return value >= 60 ? "normal" : "low";
        case "windSpeed":
          return value > 20 ? "high" : "normal";
        case "rainfall":
          return value > 10 ? "high" : value > 5 ? "medium" : "low";
        default:
          return "normal";
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
              name: labelNames[dashboardKey],
              value: unit ? `${value}${unit}` : value,
              status,
              icon: defaultIcons[dashboardKey],
              progress,
              color: defaultColors[dashboardKey],
            },
          }));
        }
      };

      onValue(sensorRef, callback);
      listeners.push({ ref: sensorRef, callback });
    });

    return () => {
      listeners.forEach(({ ref, callback }) => {
        off(ref, "value", callback);
      });
    };
  }, []);

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
};

export default Home;
