"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar-new";
import Header from "@/components/Header";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import MobileMenu from "@/components/MobileMenu";
import SensorGraph from "@/components/Sensor/SensorGraph";
import SensorHistory from "@/components/Sensor/SensorHistory";

import { firestore, auth, database } from "@/lib/firebaseConfig";
import { ref, onValue } from "firebase/database";
import {
  collection,
  query,
  orderBy,
  getDocs,
  DocumentData,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  WiHumidity,
  WiRaindrops,
  WiStrongWind,
  WiSolarEclipse,
  WiThermometer,
} from "react-icons/wi";
import { MdOpacity, MdDeviceThermostat } from "react-icons/md";
import { GiChemicalTank, GiChemicalDrop, GiMinerals } from "react-icons/gi";
import { SlChemistry } from "react-icons/sl";
import { JSX } from "react";

// ✅ Mapping sesuai dengan dashboard structure
const sensorFieldMapping: { 
  [key: string]: { 
    label: string; 
    icon: JSX.Element; 
    color: string; 
    unit: string;
  } 
} = {
  curah_hujan: {
    label: "Rainfall",
    icon: <WiRaindrops className="w-7 h-7 text-blue-600" />,
    color: "bg-blue-600",
    unit: "mm",
  },
  kecepatan_angin: {
    label: "Wind Speed",
    icon: <WiStrongWind className="w-7 h-7 text-blue-400" />,
    color: "bg-blue-400",
    unit: "m/s",
  },
  radiasi: {
    label: "Radiation",
    icon: <WiSolarEclipse className="w-7 h-7 text-yellow-500" />,
    color: "bg-yellow-500",
    unit: "W/m²",
  },
  suhu: {
    label: "Soil Temperature",
    icon: <WiThermometer className="w-7 h-7 text-red-500" />,
    color: "bg-red-500",
    unit: "°C",
  },
  kelembaban_tanah: {
    label: "Soil Moisture",
    icon: <MdOpacity className="w-7 h-7 text-green-600" />,
    color: "bg-green-600",
    unit: "%",
  },
  ph_tanah: {
    label: "Soil PH",
    icon: <SlChemistry className="w-7 h-7 text-purple-500" />,
    color: "bg-purple-500",
    unit: "",
  },
  dht_temperature: {
    label: "DHT Temperature",
    icon: <MdDeviceThermostat className="w-7 h-7 text-orange-500" />,
    color: "bg-orange-500",
    unit: "°C",
  },
  dht_humidity: {
    label: "DHT Humidity",
    icon: <WiHumidity className="w-7 h-7 text-cyan-500" />,
    color: "bg-cyan-500",
    unit: "%",
  },
  kelembaban: {
    label: "Air Humidity",
    icon: <WiHumidity className="w-7 h-7 text-green-400" />,
    color: "bg-green-400",
    unit: "%",
  },
  nitrogen: {
    label: "Nitrogen",
    icon: <GiChemicalTank className="w-7 h-7 text-blue-500" />,
    color: "bg-blue-500",
    unit: "mg/kg (mg/L)",
  },
  fosfor: {
    label: "Phosphorus",
    icon: <GiChemicalDrop className="w-7 h-7 text-purple-500" />,
    color: "bg-purple-500",
    unit: "mg/kg (mg/L)",
  },
  kalium: {
    label: "Kalium",
    icon: <GiMinerals className="w-7 h-7 text-yellow-600" />,
    color: "bg-yellow-600",
    unit: "mg/kg (mg/L)",
  },
};

interface SensorData {
  id: string;
  docId: string;
  name: string;
  value: string;
  rawValue: number;
  status: string;
  icon: JSX.Element;
  color: string;
  timestamp: string;
  field: string;
}

interface GraphData {
  timestamp: string;
  value: number;
  field: string;
  label: string;
  docId: string;
}

const SensorDetailPage = () => {
  const { id: sensorId } = useParams();
  
  const [user, loading] = useAuthState(auth);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [historyData, setHistoryData] = useState<SensorData[]>([]);
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [graphData, setGraphData] = useState<GraphData[]>([]);
  const [currentValue, setCurrentValue] = useState<string>("Loading...");
  const [currentStatus, setCurrentStatus] = useState<string>("normal");
  const [userName, setUserName] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get sensor configuration
  const sensorConfig = sensorId && typeof sensorId === 'string' ? sensorFieldMapping[sensorId] : null;

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
          setUserName(user.email?.split("@")[0] || "User");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName(user.email?.split("@")[0] || "User");
      }
    };

    fetchUserData();
  }, [user, loading]);

  // ✅ Calculate status function (sama seperti di dashboard)
  const calculateStatus = (key: string, value: number): string => {
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
      case "nitrogen":
      case "fosfor":
      case "kalium":
        return value > 100 ? "high" : "normal";
      default:
        return "normal";
    }
  };

  // ✅ Fetch historical data dari Firestore
  useEffect(() => {
    const fetchSensorData = async () => {
      if (!sensorId || !sensorConfig) return;

      setIsLoading(true);
      setError(null);

      try {
        const colRef = collection(firestore, "sensorHistory");
        const q = query(colRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        
        const fetchedData: SensorData[] = [];
        const chartData: GraphData[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const readableTime = data.timestamp?.toDate
            ? new Date(data.timestamp.toDate()).toLocaleString()
            : new Date(data.timestamp).toLocaleString();

          // Check if this document has data for our specific sensor
          const dataValue = data[sensorId as string] || 
                           (sensorId === 'fosfor' ? data['phosphorus'] : null);
          
          if (dataValue !== undefined && dataValue !== null) {
            const numericValue = parseFloat(dataValue);
            const status = calculateStatus(sensorId as string, numericValue);
            
            fetchedData.push({
              id: `${doc.id}_${sensorId}`,
              docId: doc.id,
              name: sensorConfig.label,
              value: `${dataValue}${sensorConfig.unit}`,
              rawValue: numericValue || 0,
              status: status,
              icon: sensorConfig.icon,
              color: sensorConfig.color,
              timestamp: readableTime,
              field: sensorId as string
            });

            if (!isNaN(numericValue)) {
              chartData.push({
                timestamp: readableTime,
                value: numericValue,
                field: sensorId as string,
                label: sensorConfig.label,
                docId: doc.id
              });
            }
          }
        });

        setAllData(fetchedData);
        setGraphData(chartData.reverse()); // urutkan dari lama ke baru
      } catch (error) {
        console.error("Error fetching sensor data:", error);
        setError("Failed to fetch sensor data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSensorData();
  }, [sensorId, sensorConfig]);

  // ✅ Update history data untuk pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setHistoryData(allData.slice(startIndex, endIndex));
  }, [currentPage, allData, recordsPerPage]);

  // Show error state
  if (error || !sensorConfig) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">
          {error || "Sensor not found"}
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(allData.length / recordsPerPage);

  return (
    <MultiRoleProtectedRoute allowedRoles={["user", "operator", "petani", "manager"]}>
      <div className="flex min-h-screen bg-gray-50">
        <MobileMenu currentPage="dashboard" />
        <div className="hidden lg:block">
          <Sidebar currentPage="dashboard" />
        </div>

        <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
          <Header title={`${sensorConfig.label} Detail`} userName={userName} />

          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-gray-50 min-h-screen">
            {/* Historical Data Graph */}
            {allData.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <SensorGraph
                    title={`${sensorConfig.label} Historical Trend`}
                    data={graphData}
                    sensorId={sensorId as string}
                  />
                </div>
              </div>
            )}

            {/* History Table */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                
                <div className="overflow-x-auto">
                  <SensorHistory 
                    data={historyData} 
                    allData={allData}
                    currentPage={currentPage}
                    recordsPerPage={recordsPerPage}
                    totalRecords={allData.length}
                  />
                </div>
              </div>
            </div>

            {/* Back to Dashboard Button */}
            <div className="flex justify-center">
              <button
                onClick={() => window.history.back()}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <span>←</span>
                <span>Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default SensorDetailPage;