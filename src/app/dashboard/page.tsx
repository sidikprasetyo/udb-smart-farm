"use client";

import React, { useState, useEffect, JSX } from "react";
import Head from "next/head";
import Sidebar from "@/components/Sidebar-new";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import RoleSwitcher from "@/components/RoleSwitcher";
import MobileMenu from "@/components/MobileMenu";
import { DashboardData, SensorData } from "@/types/dashboard";
import { ref, onValue } from "firebase/database";
import { database, firestore, auth } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  WiHumidity,
  WiRaindrops,
  WiStrongWind,
  WiSolarEclipse,
  WiThermometer,
} from "react-icons/wi";
import { MdOpacity, MdDeviceThermostat } from "react-icons/md";
import { SlChemistry } from "react-icons/sl";
import { GiChemicalTank , GiChemicalDrop, GiMinerals } from "react-icons/gi";

const Home: React.FC = () => {
  const [user, loading] = useAuthState(auth);
  const [userName, setUserName] = useState<string>("Loading...");
  
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    curah_hujan: {
      id: "curah_hujan",
      name: "Rainfall",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    dht_humidity: {
      id: "dht_humidity",
      name: "DHT Humidity",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    dht_temperature: {
      id: "dht_temperature",
      name: "DHT Temperature",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    kecepatan_angin: {
      id: "kecepatan_angin",
      name: "Wind Speed",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    kelembaban: {
      id: "kelembaban",
      name: "Air Humidity",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    kelembaban_tanah: {
      id: "kelembaban_tanah",
      name: "Soil Moisture",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    ph_tanah: {
      id: "ph_tanah",
      name: "Soil pH",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    radiasi: {
      id: "radiasi",
      name: "Radiation",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    suhu: {
      id: "suhu",
      name: "Soil Temperature",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    natrium: {
      id: "natrium",
      name: "Natrium",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    fosfor: {
      id: "fosfor",
      name: "Phosphorus",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    kalium: {
      id: "kalium",
      name: "Kalium",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    timestamp: "",
  });

  const defaultColors: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: "bg-blue-600",
    dht_humidity: "bg-cyan-500",
    dht_temperature: "bg-orange-500",
    kecepatan_angin: "bg-blue-400",
    kelembaban: "bg-green-400",
    kelembaban_tanah: "bg-green-600",
    ph_tanah: "bg-purple-500",
    radiasi: "bg-yellow-500",
    suhu: "bg-red-500",
    natrium: "bg-blue-500",
    fosfor: "bg-purple-500",
    kalium: "bg-yellow-600",
  };

  const defaultIcons: { [key in keyof Omit<DashboardData, "timestamp">]: JSX.Element } = {
    curah_hujan: <WiRaindrops className="w-7 h-7 text-blue-600" />,
    dht_humidity: <WiHumidity className="w-7 h-7 text-cyan-500" />,
    dht_temperature: <MdDeviceThermostat className="w-7 h-7 text-orange-500" />,
    kecepatan_angin: <WiStrongWind className="w-7 h-7 text-blue-400" />,
    kelembaban: <WiHumidity className="w-7 h-7 text-green-400" />,
    kelembaban_tanah: <MdOpacity className="w-7 h-7 text-green-600" />,
    ph_tanah: <SlChemistry className="w-7 h-7 text-purple-500" />,
    radiasi: <WiSolarEclipse className="w-7 h-7 text-yellow-500" />,
    suhu: <WiThermometer className="w-7 h-7 text-red-500" />,
    natrium: <GiChemicalTank className="w-7 h-7 text-blue-500" />,
    fosfor: <GiChemicalDrop className="w-7 h-7 text-purple-500" />,
    kalium: <GiMinerals className="w-7 h-7 text-yellow-600" />,
  };

  const units: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: "mm",
    dht_humidity: "%",
    dht_temperature: "°C",
    kecepatan_angin: "m/s",
    kelembaban: "%",
    kelembaban_tanah: "%",
    ph_tanah: "",
    radiasi: "W/m²",
    suhu: "°C",
    natrium: "mg/kg (mg/L)",
    fosfor: "mg/kg (mg/L)",
    kalium: "mg/kg (mg/L)",
  };

  const labelNames: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: "Rainfall",
    dht_humidity: "DHT Humidity",
    dht_temperature: "DHT Temperature",
    kecepatan_angin: "Wind Speed",
    kelembaban: "Air Humidity",
    kelembaban_tanah: "Soil Moisture",
    ph_tanah: "Soil PH",
    radiasi: "Radiation",
    suhu: "Soil Temperature",
    natrium: "Natrium",
    fosfor: "Phosphorus",
    kalium: "Kalium",
  };

  // ✅ Fetch username berdasarkan user yang login
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || loading) return;

      try {
        const userDocRef = doc(firestore, "staff", user.email || "");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.username || userData.email || "User");
        } else {
          // Jika tidak ditemukan di collection staff, gunakan email
          setUserName(user.email?.split("@")[0] || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName(user.email?.split("@")[0] || "User");
      }
    };

    fetchUserData();
  }, [user, loading]);

  const calculateStatus = (key: keyof Omit<DashboardData, "timestamp">, value: number): SensorData["status"] => {
    switch (key) {
      case "kelembaban_tanah":
      case "kelembaban":
        return value >= 60 ? "optimal" : value >= 40 ? "normal" : "low";
      case "ph_tanah":
        return value >= 6 && value <= 7.5 ? "normal" : "high";
      case "radiasi":
        return value > 5 ? "high" : "normal";
      case "suhu":
      case "dht_temperature":
        return value > 30 ? "high" : value >= 20 ? "normal" : "low";
      case "dht_humidity":
        return value >= 60 ? "normal" : "low";
      case "kecepatan_angin":
        return value > 20 ? "high" : "normal";
      case "curah_hujan":
        return value > 10 ? "high" : value > 5 ? "medium" : "low";
      case "natrium":
        return value > 100 ? "high" : "normal";
      case "fosfor":
        return value > 100 ? "high" : "normal";
      case "kalium":
        return value > 100 ? "high" : "normal";
      default:
        return "normal";
    }
  };

  const loadSensorData = (sensorId: string, key: keyof Omit<DashboardData, "timestamp">) => {
    const sensorRef = ref(database, `sensor/${sensorId}`);
    onValue(sensorRef, (snapshot) => {
      const rawValue = snapshot.val() || "0";
      if (rawValue != null && !isNaN(parseFloat(rawValue))) {
        const value = parseFloat(rawValue);
        const unit = units[key];
        const status = calculateStatus(key, value);
        const progress = Math.min(Math.max(Math.round(value), 0), 100);

        setDashboardData((prevData) => ({
          ...prevData,
          [key]: {
            id: key,
            name: labelNames[key],
            value: unit ? `${value}${unit}` : value.toString(),
            status,
            icon: defaultIcons[key],
            progress,
            color: defaultColors[key],
          },
          timestamp: new Date().toISOString(),
        }));
      }
    });
  };

  useEffect(() => {
    loadSensorData("curah_hujan", "curah_hujan");
    loadSensorData("dht_humidity", "dht_humidity");
    loadSensorData("dht_temperature", "dht_temperature");
    loadSensorData("kecepatan_angin", "kecepatan_angin");
    loadSensorData("kelembaban", "kelembaban");
    loadSensorData("kelembaban_tanah", "kelembaban_tanah");
    loadSensorData("ph_tanah", "ph_tanah");
    loadSensorData("radiasi", "radiasi");
    loadSensorData("suhu", "suhu");
    loadSensorData("natrium", "natrium");
    loadSensorData("phosphorus", "fosfor");
    loadSensorData("kalium", "kalium");
  }, []);

  return (
    <MultiRoleProtectedRoute allowedRoles={["operator", "petani"]}>
      <Head>
        <title>Smart Farm Dashboard</title>
        <meta name="description" content="IoT Smart Farm Monitoring Dashboard" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen bg-gray-50">
        <MobileMenu currentPage="dashboard" />
        <div className="hidden lg:flex">
          <Sidebar currentPage="dashboard" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
          <Header title="Dashboard" userName={userName} />
          <div className="px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 pb-0">
            <RoleSwitcher />
          </div>
          <div className="flex-1 overflow-hidden">
            <Dashboard data={dashboardData} />
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default Home;