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
import { FcElectricalSensor } from "react-icons/fc";

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
    kelembaban_udara: {
      id: "kelembaban_udara",
      name: "Air Humidity",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    suhu_udara: {
      id: "suhu_udara",
      name: "Air Temperature",
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
    ec_tanah: {
      id: "ec_tanah",
      name: "EC Soil",
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
    suhu_tanah: {
      id: "suhu_tanah",
      name: "Soil Temperature",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    nitrogen: {
      id: "nitrogen",
      name: "Nitrogen",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    phosphorus: {
      id: "phosphorus",
      name: "Phosphorus",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    kalium: {
      id: "kalium",
      name: "Potassium",
      value: "Loading...",
      status: "normal",
      icon: "",
      progress: 0,
      color: "",
    },
    waktu: "",
  });

  const defaultColors: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: "bg-blue-600",
    kelembaban_udara: "bg-cyan-500",
    suhu_udara: "bg-orange-500",
    kecepatan_angin: "bg-blue-400",
    ec_tanah: "bg-cyan-400",
    kelembaban_tanah: "bg-green-600",
    ph_tanah: "bg-purple-500",
    radiasi: "bg-yellow-500",
    suhu_tanah: "bg-red-500",
    nitrogen: "bg-blue-500",
    phosphorus: "bg-purple-500",
    kalium: "bg-yellow-600",
  };

  const defaultIcons: { [key in keyof Omit<DashboardData, "timestamp">]: JSX.Element } = {
    curah_hujan: <WiRaindrops className="w-7 h-7 text-blue-600" />,
    kelembaban_udara: <WiHumidity className="w-7 h-7 text-cyan-500" />,
    suhu_udara: <MdDeviceThermostat className="w-7 h-7 text-orange-500" />,
    kecepatan_angin: <WiStrongWind className="w-7 h-7 text-blue-400" />,
    ec_tanah: <FcElectricalSensor className="w-7 h-7 text-green-400" />,
    kelembaban_tanah: <MdOpacity className="w-7 h-7 text-green-600" />,
    ph_tanah: <SlChemistry className="w-7 h-7 text-purple-500" />,
    radiasi: <WiSolarEclipse className="w-7 h-7 text-yellow-500" />,
    suhu_tanah: <WiThermometer className="w-7 h-7 text-red-500" />,
    nitrogen: <GiChemicalTank className="w-7 h-7 text-blue-500" />,
    phosphorus: <GiChemicalDrop className="w-7 h-7 text-purple-500" />,
    kalium: <GiMinerals className="w-7 h-7 text-yellow-600" />,
  };

  const units: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: " mm",
    kelembaban_udara: " %RH",
    suhu_udara: " °C",
    kecepatan_angin: " m/s",
    ec_tanah: " dS/m",
    kelembaban_tanah: " %",
    ph_tanah: "",
    radiasi: " W/m²",
    suhu_tanah: " °C",
    nitrogen: " mg/kg",
    phosphorus: " mg/kg",
    kalium: " mg/kg",
  };

  const labelNames: { [key in keyof Omit<DashboardData, "timestamp">]: string } = {
    curah_hujan: "Rainfall",
    kelembaban_udara: "Air Humidity",
    suhu_udara: "Air Temperature",
    kecepatan_angin: "Wind Speed",
    ec_tanah: "EC Soil",
    kelembaban_tanah: "Soil Moisture",
    ph_tanah: "Soil PH",
    radiasi: "Radiation",
    suhu_tanah: "Soil Temperature",
    nitrogen: "Nitrogen",
    phosphorus: "Phosphorus",
    kalium: "Potassium",
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
        return value > 50 ? "very wet" : value > 35 ? "wet" : value > 20 ? "moist" : value > 0 ? "dry" : "very dry";
      case "ec_tanah":
        return value > 8 ? "very high" : value > 4 ? "high" : value > 2.5 ? "slightly high" : value > 1 ? "moderate" : value > 0.5 ? "low" : "very low";
      case "ph_tanah":
        return value > 8 ? "strongly alkaline" : value > 7.4 ? "moderately alkaline" : value > 6.6 ? "neutral" : value > 5.5 ? "moderate acidic" : "strongly acidic";
      case "radiasi":
        return value > 900 ? "very high" : value > 601 ? "high" : value > 301 ? "moderate" : value > 100 ? "low" : "very low";
      case "suhu_tanah":
        return value > 35 ? "very high" : value > 26 ? "high" : value > 16 ? "moderate" : value > 10 ? "low" : "very low";
      case "suhu_udara":
        return value > 35 ? "very high" : value > 31 ? "high" : value > 21 ? "moderate" : value > 10 ? "low" : "very low";
      case "kelembaban_udara":
        return value > 80 ? "very humid" : value > 61 ? "humid" : value > 41 ? "comfortable" : value > 31 ? "dry" : "very dry";
      case "kecepatan_angin":
        return value > 15 ? "very strong" : value > 10 ? "strong" : value > 5 ? "moderate" : value > 1.6 ? "weak" : "very weak";
      case "curah_hujan":
        return value > 100 ? "very heavy rain" : value > 50 ? "heavy rain" : value > 20 ? "moderate rain" : value > 5 ? "light rain" : value > 0.1 ? "drizzle" : "no rain";
      case "nitrogen":
        return value > 60 ? "very high" : value > 41 ? "high" : value > 21 ? "moderate" : value > 10 ? "low" : "very low";
      case "phosphorus":
        return value > 50 ? "very high" : value > 31 ? "high" : value > 16 ? "medium" : value > 5 ? "low" : "very low";
      case "kalium":
        return value > 250 ? "very high" : value > 150 ? "high" : value > 100 ? "moderate" : value > 50 ? "low" : "very low";
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
          waktu: new Date().toISOString(),
        }));
      }
    });
  };

  useEffect(() => {
    loadSensorData("curah_hujan", "curah_hujan");
    loadSensorData("kelembaban_udara", "kelembaban_udara");
    loadSensorData("suhu_udara", "suhu_udara");
    loadSensorData("kecepatan_angin", "kecepatan_angin");
    loadSensorData("ec_tanah", "ec_tanah");
    loadSensorData("kelembaban_tanah", "kelembaban_tanah");
    loadSensorData("ph_tanah", "ph_tanah");
    loadSensorData("radiasi", "radiasi");
    loadSensorData("suhu_tanah", "suhu_tanah");
    loadSensorData("nitrogen", "nitrogen");
    loadSensorData("phosphorus", "phosphorus");
    loadSensorData("kalium", "kalium");
  }, []);

  return (
    <MultiRoleProtectedRoute allowedRoles={["operator", "petani"]}>

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