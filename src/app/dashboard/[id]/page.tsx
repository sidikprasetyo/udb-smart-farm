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
import { FcElectricalSensor } from "react-icons/fc";

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
    unit: " mm",
  },
  kecepatan_angin: {
    label: "Wind Speed",
    icon: <WiStrongWind className="w-7 h-7 text-blue-400" />,
    color: "bg-blue-400",
    unit: " m/s",
  },
  radiasi: {
    label: "Radiation",
    icon: <WiSolarEclipse className="w-7 h-7 text-yellow-500" />,
    color: "bg-yellow-500",
    unit: " W/m²",
  },
  suhu_tanah: {
    label: "Soil Temperature",
    icon: <WiThermometer className="w-7 h-7 text-red-500" />,
    color: "bg-red-500",
    unit: " °C",
  },
  kelembaban_tanah: {
    label: "Soil Moisture",
    icon: <MdOpacity className="w-7 h-7 text-green-600" />,
    color: "bg-green-600",
    unit: " %",
  },
  ph_tanah: {
    label: "Soil PH",
    icon: <SlChemistry className="w-7 h-7 text-purple-500" />,
    color: "bg-purple-500",
    unit: "",
  },
  suhu_udara: {
    label: "Air Temperature",
    icon: <MdDeviceThermostat className="w-7 h-7 text-orange-500" />,
    color: "bg-orange-500",
    unit: " °C",
  },
  kelembaban_udara: {
    label: "Air Humidity",
    icon: <WiHumidity className="w-7 h-7 text-cyan-500" />,
    color: "bg-cyan-500",
    unit: " %RH",
  },
  ec_tanah: {
    label: "EC Soil",
    icon: <FcElectricalSensor className="w-7 h-7 text-green-400" />,
    color: "bg-cyan-400",
    unit: " dS/m",
  },
  nitrogen: {
    label: "Nitrogen",
    icon: <GiChemicalTank className="w-7 h-7 text-blue-500" />,
    color: "bg-blue-500",
    unit: " mg/kg",
  },
  phosphorus: {
    label: "Phosphorus",
    icon: <GiChemicalDrop className="w-7 h-7 text-purple-500" />,
    color: "bg-purple-500",
    unit: " mg/kg",
  },
  kalium: {
    label: "Kalium",
    icon: <GiMinerals className="w-7 h-7 text-yellow-600" />,
    color: "bg-yellow-600",
    unit: " mg/kg",
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
  waktu: string;
  field: string;
}

interface GraphData {
  waktu: string;
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

  // ✅ Fetch historical data dari Firestore
  // ✅ Perbaikan untuk menangani nilai 0 yang dianggap falsy
useEffect(() => {
  const fetchSensorData = async () => {
    if (!sensorId || !sensorConfig) return;

    setIsLoading(true);
    setError(null);

    try {
      const colRef = collection(firestore, "dataHistoryPTLM");
      const q = query(colRef, orderBy("waktu", "desc"));
      const snapshot = await getDocs(q);
      
      const fetchedData: SensorData[] = [];
      const chartData: GraphData[] = [];

      console.log(`Total documents in collection: ${snapshot.size}`);

      snapshot.forEach((doc) => {
        const data = doc.data();
        
        console.log(`Document ${doc.id}:`, data);
        
        // Parse waktu
        let readableTime = "Invalid Date";
        
        if (data.waktu) {
          try {
            if (data.waktu?.toDate && typeof data.waktu.toDate === 'function') {
              readableTime = new Date(data.waktu.toDate()).toLocaleString();
            }
            else if (typeof data.waktu === 'string') {
              const [datePart, timePart] = data.waktu.split(' ');
              const [day, month, year] = datePart.split('/');
              const [hour, minute, second] = timePart.split(':');
              
              const parsedDate = new Date(
                parseInt(year), 
                parseInt(month) - 1,
                parseInt(day), 
                parseInt(hour), 
                parseInt(minute), 
                parseInt(second)
              );
              
              if (!isNaN(parsedDate.getTime())) {
                readableTime = parsedDate.toLocaleString();
              }
            }
            else if (typeof data.waktu === 'number') {
              readableTime = new Date(data.waktu).toLocaleString();
            }
            else {
              const parsedDate = new Date(data.waktu);
              if (!isNaN(parsedDate.getTime())) {
                readableTime = parsedDate.toLocaleString();
              }
            }
          } catch (error) {
            console.error("Error parsing waktu:", error, data.waktu);
            readableTime = "Invalid Date";
          }
        }

        // ✅ PERBAIKAN UTAMA: Jangan gunakan || operator untuk nilai yang bisa 0
        let dataValue;
        
        if (sensorId === 'fosfor' && data.hasOwnProperty('phosphorus')) {
          dataValue = data['phosphorus'];
        } else if (data.hasOwnProperty(sensorId as string)) {
          dataValue = data[sensorId as string];
        } else {
          console.log(`Field ${sensorId} not found in document ${doc.id}`);
          return; // Skip jika field tidak ada
        }
        
        console.log(`Sensor ${sensorId} value:`, dataValue, typeof dataValue);
        console.log(`Direct access data['${sensorId}']:`, data[sensorId as string]);
        
        // ✅ Hanya skip jika benar-benar null atau undefined
        if (dataValue === null || dataValue === undefined) {
          console.log(`Skipping null/undefined value for ${sensorId}`);
          return;
        }

        // Skip string kosong atau invalid strings
        if (dataValue === "" || dataValue === "null" || dataValue === "undefined") {
          console.log(`Skipping empty/invalid string value for ${sensorId}:`, dataValue);
          return;
        }

        // Parse numeric value - TERMASUK nilai 0
        let numericValue: number;
        
        if (typeof dataValue === 'number') {
          numericValue = dataValue;
        } else {
          numericValue = parseFloat(dataValue);
          if (isNaN(numericValue)) {
            console.log(`Cannot parse to number for ${sensorId}:`, dataValue);
            return;
          }
        }
        
        console.log(`✅ Processing value - Numeric:`, numericValue, `(original: ${dataValue})`);
        
        const status = calculateStatus(sensorId as string, numericValue);
        
        const sensorDataItem = {
          id: `${doc.id}_${sensorId}`,
          docId: doc.id,
          name: sensorConfig.label,
          value: `${numericValue}${sensorConfig.unit}`,
          rawValue: numericValue,
          status: status,
          icon: sensorConfig.icon,
          color: sensorConfig.color,
          waktu: readableTime,
          field: sensorId as string
        };
        
        console.log(`✅ ADDING sensor data with value ${numericValue}:`, sensorDataItem);
        
        fetchedData.push(sensorDataItem);

        chartData.push({
          waktu: readableTime,
          value: numericValue,
          field: sensorId as string,
          label: sensorConfig.label,
          docId: doc.id
        });
      });

      console.log(`Final fetched data count: ${fetchedData.length}`);
      console.log(`All fetched data:`, fetchedData);
      
      // ✅ Debug: Log contoh data yang akan ditampilkan
      if (fetchedData.length > 0) {
        console.log(`Sample data values:`, fetchedData.slice(0, 3).map(item => ({
          docId: item.docId,
          value: item.value,
          rawValue: item.rawValue
        })));
      }
      
      setAllData(fetchedData);
      setGraphData(chartData.reverse());
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
                  <SensorGraph
                    title={`${sensorConfig.label} Historical Trend`}
                    data={graphData}
                    sensorId={sensorId as string}
                  />
              </div>
            )}

            {/* History Table */}
            <div className="mb-8">
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
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default SensorDetailPage;