"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar-new";
import Header from "@/components/Header";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import MobileMenu from "@/components/MobileMenu";
import SensorGraph from "@/components/Sensor/SensorGraph";
import SensorHistory from "@/components/Sensor/SensorHistory";

import { firestore } from "@/lib/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  getDocs,
  DocumentData,
} from "firebase/firestore";

import {
  WiHumidity,
  WiRaindrops,
  WiStrongWind,
  WiSolarEclipse,
  WiThermometer,
} from "react-icons/wi";
import { MdOpacity, MdDeviceThermostat } from "react-icons/md";
import { GiChemicalTank , GiChemicalDrop, GiMinerals } from "react-icons/gi";
import { SlChemistry } from "react-icons/sl";
import { JSX } from "react";

// ✅ Mapping label
const labelNames: { [key: string]: string } = {
  kelembaban_tanah: "Soil Moisture",
  ph_tanah: "Soil PH",
  curah_hujan: "Rainfall",
  kecepatan_angin: "Wind Speed",
  suhu: "Soil Temperature",
  dht_temperature: "DHT Temperature",
  dht_humidity: "DHT Humidity",
  kelembaban: "Air Humidity",
  radiasi: "Radiation",
  natrium: "Natrium",
  fosfor: "Phosporus",
  kalium: "Kalium",
};

// ✅ Mapping ikon
const iconMap: { [key: string]: JSX.Element } = {
  kelembaban_tanah: <MdOpacity className="w-5 h-5 text-green-600" />,
  ph_tanah: <SlChemistry className="w-5 h-5 text-purple-500" />,
  curah_hujan: <WiRaindrops className="w-5 h-5 text-blue-600" />,
  kecepatan_angin: <WiStrongWind className="w-5 h-5 text-blue-400" />,
  suhu: <WiThermometer className="w-5 h-5 text-red-500" />,
  dht_temperature: <MdDeviceThermostat className="w-5 h-5 text-orange-500" />,
  dht_humidity: <WiHumidity className="w-5 h-5 text-cyan-500" />,
  kelembaban: <WiHumidity className="w-5 h-5 text-green-400" />,
  radiasi: <WiSolarEclipse className="w-5 h-5 text-yellow-500" />,
  natrium: <GiChemicalTank className="w-7 h-7 text-blue-500" />,
  fosfor: <GiChemicalDrop className="w-7 h-7 text-purple-500" />,
  kalium: <GiMinerals className="w-7 h-7 text-yellow-600" />,
};

// ✅ Mapping warna (Tailwind)
const colorMap: { [key: string]: string } = {
  kelembaban_tanah: "bg-green-600",
  ph_tanah: "bg-purple-500",
  curah_hujan: "bg-blue-600",
  kecepatan_angin: "bg-blue-400",
  suhu: "bg-red-500",
  dht_temperature: "bg-orange-500",
  dht_humidity: "bg-cyan-500",
  kelembaban: "bg-green-400",
  radiasi: "bg-yellow-500",
  natrium: "bg-blue-500",
  fosfor: "bg-purple-500",
  kalium: "bg-yellow-600",
};

const SensorDetailPage = () => {
  const { id: sensorId } = useParams();
  const [currentPage, ] = useState(1);
  const [recordsPerPage] = useState(8);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [historyData, setHistoryData] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [allData, setAllData] = useState<any[]>([]);
  const [, setGraphData] = useState<{ timestamp: string; value: number }[]>([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      if (!sensorId) return;

      const colRef = collection(
        firestore,
        "sensor_history",
        sensorId as string,
        "history"
      );
      const q = query(colRef, orderBy("timestamp", "desc"));

      try {
        const snapshot = await getDocs(q);
        const fetchedData: DocumentData[] = [];
        const chartData: { timestamp: string; value: number }[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          const readableTime = data.timestamp?.toDate
            ? new Date(data.timestamp.toDate()).toLocaleString()
            : new Date(data.timestamp).toLocaleString();

          const numericValue = parseFloat(data.value);

          fetchedData.push({
            id: doc.id,
            name: labelNames[sensorId as string] || sensorId,
            value: data.value ?? "N/A",
            status: "Normal",
            icon: iconMap[sensorId as string] || "📟",
            color: colorMap[sensorId as string] || "bg-gray-400",
            timestamp: readableTime,
          });

          if (!isNaN(numericValue)) {
            chartData.push({
              timestamp: readableTime,
              value: numericValue,
            });
          }
        });

        setAllData(fetchedData);
        setGraphData(chartData.reverse()); // urutkan dari lama ke baru
      } catch (error) {
        console.error("Error fetching sensor history:", error);
      }
    };

    fetchSensorData();
  }, [sensorId]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setHistoryData(allData.slice(startIndex, endIndex));
  }, [currentPage, allData, recordsPerPage]);

  return (
    <MultiRoleProtectedRoute allowedRoles={["user", "operator", "petani", "manager"]}>
      <div className="flex min-h-screen bg-gray-50">
        <MobileMenu currentPage="dashboard" />
        <div className="hidden lg:block">
          <Sidebar currentPage="dashboard" />
        </div>

        <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
          <Header title="Dashboard" userName="Admin" />

          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-gray-50 min-h-screen">
            {/* Grafik sensor */}
            <div className="mb-4 md:mb-6 lg:mb-8">
              <div className="w-full flex justify-center">
                <SensorGraph
                    title={labelNames[sensorId as string] || sensorId as string}
                    data={allData.map((item) => ({
                      timestamp: item.timestamp,
                      value: parseFloat(item.value),
                    }))}
                    sensorId={sensorId as string}
                  />
              </div>
            </div>

            {/* History & Pagination */}
            <div className="space-y-4 md:space-y-6">
              <div className="w-full overflow-x-auto">
                <SensorHistory data={historyData} allData={allData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default SensorDetailPage;
