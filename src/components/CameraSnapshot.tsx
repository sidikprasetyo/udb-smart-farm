/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaExpand, FaSync } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { collection, query as firestoreQuery, orderBy, limit, onSnapshot } from "firebase/firestore";
import { database, firestore } from "@/lib/firebaseConfig";
import { GiWaterDrop } from "react-icons/gi";
import { 
  WiDaySunny, 
  WiCloudy, 
  WiRain, 
  WiDayRainMix,
  WiThermometer,
  WiHumidity 
} from "react-icons/wi";

interface CameraSnapshotProps {
  alt?: string;
  refreshInterval?: number;
  title?: string;
  className?: string;
}

interface ForecastData {
  curah_hujan: number;
  kecepatan_angin: number;
  kelembaban_udara: number;
  radiasi: number;
  suhu_udara: number;
  prediction: string;
  timestamp: string;
}

const CameraSnapshot = ({ alt = "Camera Snapshot", refreshInterval = 5000, title = "ESP32 Snapshot", className = "" }: CameraSnapshotProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [imageInfo, setImageInfo] = useState<{
    fileName?: string;
    uploadTime?: string;
    fileSize?: number;
    lastModified?: string;
  }>({});
  const [error, setError] = useState<string | null>(null);
  const [pumpStatus, setPumpStatus] = useState<{
    text: string;
    color: string;
    bgColor: string;
    fullText: string;
    isLoading: boolean;
  }>({
    text: "Loading",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    fullText: "Loading pump status...",
    isLoading: true,
  });
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);
  const [forecastLoading, setForecastLoading] = useState(true);
  const router = useRouter();

  // Function to get weather icon based on prediction
  const getWeatherIcon = (prediction: string) => {
    if (!prediction || prediction.toLowerCase() === 'unknown') {
      return <WiCloudy className="text-2xl text-gray-400" />;
    }
    
    const pred = prediction.toLowerCase();
    if (pred.includes('cerah')) {
      return <WiDaySunny className="text-2xl text-yellow-500" />;
    } else if (pred.includes('mendung')) {
      return <WiCloudy className="text-2xl text-gray-600" />;
    } else if (pred.includes('gerimis')) {
      return <WiDayRainMix className="text-2xl text-blue-400" />;
    } else if (pred.includes('hujan')) {
      return <WiRain className="text-2xl text-blue-600" />;
    } else {
      return <WiCloudy className="text-2xl text-gray-400" />;
    }
  };

  // Function to get weather color class
  const getWeatherColor = (prediction: string) => {
    if (!prediction || prediction.toLowerCase() === 'unknown') {
      return 'text-gray-500';
    }
    
    const pred = prediction.toLowerCase();
    if (pred.includes('cerah')) {
      return 'text-yellow-600';
    } else if (pred.includes('mendung')) {
      return 'text-gray-600';
    } else if (pred.includes('gerimis')) {
      return 'text-blue-500';
    } else if (pred.includes('hujan')) {
      return 'text-blue-600';
    } else {
      return 'text-gray-500';
    }
  };

  // Function to format timestamp
  function formatTimestamp(timestamp: any): string {
  try {
    if (!timestamp) return 'N/A';

    let date: Date;

    // Firestore Timestamp
    if (typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    }
    // Date object
    else if (timestamp instanceof Date) {
      date = timestamp;
    }
    // String
    else if (typeof timestamp === 'string') {
      const parsed = new Date(timestamp);
      if (isNaN(parsed.getTime())) return 'Invalid date';
      date = parsed;
    }
    // Fallback
    else {
      return 'Invalid date';
    }

    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch {
    return 'Invalid date';
  }
}

  // Ambil nama file terbaru
  const fetchLatestImage = async () => {
    try {
      setError(null);
      const res = await fetch("/api/latest-image");
      if (!res.ok) throw new Error("Network response not ok");

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImageInfo({
          fileName: data.fileName,
          uploadTime: data.uploadTime,
          fileSize: data.fileSize,
          lastModified: data.lastModified,
        });
        setIsLoading(false);
      } else {
        setImageUrl("");
        setImageInfo({});
        setIsLoading(false);
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err) {
      console.error("Failed to fetch latest image:", err);
      setError("Gagal memuat gambar terbaru");
      setIsLoading(false);
    }
  };

  // Load forecast data from Firestore
  const loadForecastData = () => {
    try {
      const forecastRef = collection(firestore, 'forecasts');
      const q = firestoreQuery(
        forecastRef, 
        orderBy('timestamp', 'desc'), 
        limit(1)
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const latestDoc = snapshot.docs[0];
          const data = latestDoc.data();
          
          // Extract input_data if it exists
          const inputData = data.input_data || {};
          
          // Get prediction with fallback
          let prediction = inputData.prediction || data.prediction || 'No data';
          if (!prediction || prediction.toLowerCase() === 'unknown' || prediction.trim() === '') {
            prediction = 'No data';
          }
          
          // Get timestamp with fallback
          let timestampValue = inputData.timestamp || data.timestamp;
          if (!timestampValue) {
            timestampValue = new Date().toISOString();
          }
          
          const forecastInfo: ForecastData = {
            curah_hujan: inputData.curah_hujan || 0,
            kecepatan_angin: inputData.kecepatan_angin || 0,
            kelembaban_udara: inputData.kelembaban_udara || 0,
            radiasi: inputData.radiasi || 0,
            suhu_udara: inputData.suhu_udara || 0,
            prediction: prediction,
            timestamp: timestampValue
          };
          
          setForecastData(forecastInfo);
          setForecastLoading(false);
        } else {
          console.log('No forecast documents found');
          setForecastData(null);
          setForecastLoading(false);
        }
      }, (error) => {
        console.error('Error loading forecast data:', error);
        setForecastData(null);
        setForecastLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up forecast listener:', error);
      setForecastData(null);
      setForecastLoading(false);
      return () => {};
    }
  };

  // Load status pompa dari Firebase
  const loadPumpStatus = () => {
    const pompRef = ref(database, `sensor/status_pompa`);
    onValue(
      pompRef,
      (snapshot) => {
        const rawValue = snapshot.val();

        if (rawValue != null) {
          const statusMessage = rawValue.toString();
          const lowerValue = statusMessage.toLowerCase();

          let statusDisplay;
          if (lowerValue.includes("otomatis") || lowerValue.includes("telah") || lowerValue === "on" || lowerValue === "1") {
            statusDisplay = {
              text: "ACTIVE",
              color: "text-green-600",
              bgColor: "bg-green-50",
              fullText: statusMessage,
              isLoading: false,
            };
          } else if (
            lowerValue.includes("tidak") ||
            lowerValue.includes("bukan") ||
            lowerValue.includes("jam") ||
            lowerValue.includes("suhu") ||
            lowerValue.includes("terlalu") ||
            lowerValue.includes("tinggi") ||
            lowerValue.includes("rendah") ||
            lowerValue.includes("udara") ||
            lowerValue.includes("kelembaban") ||
            lowerValue.includes("tercapai") ||
            lowerValue.includes("tanah") ||
            lowerValue === "0"
          ) {
            statusDisplay = {
              text: "OFF",
              color: "text-red-600",
              bgColor: "bg-red-50",
              fullText: statusMessage,
              isLoading: false,
            };
          } else {
            statusDisplay = {
              text: "INFO",
              color: "text-blue-600",
              bgColor: "bg-blue-50",
              fullText: statusMessage,
              isLoading: false,
            };
          }

          setPumpStatus(statusDisplay);
        } else {
          setPumpStatus({
            text: "Unknown",
            color: "text-gray-600",
            bgColor: "bg-gray-50",
            fullText: "No data available",
            isLoading: false,
          });
        }
      },
      (error) => {
        console.error("Error loading pump status:", error);
        setPumpStatus({
          text: "Error",
          color: "text-red-600",
          bgColor: "bg-red-50",
          fullText: "Failed to load pump status",
          isLoading: false,
        });
      }
    );
  };

  const handleOpenCamera = () => {
    router.push("/dashboard/cam");
  };

  const handleRefresh = () => {
    setTimestamp(Date.now());
    fetchLatestImage();
  };

  useEffect(() => {
    fetchLatestImage(); // Saat pertama
    loadPumpStatus(); // Load pump status
    const unsubscribeForecast = loadForecastData(); // Load forecast data

    const interval = setInterval(() => {
      setTimestamp(Date.now());
      fetchLatestImage(); // Update berkala
    }, refreshInterval);

    return () => {
      clearInterval(interval);
      unsubscribeForecast(); // Clean up forecast listener
    };
  }, [refreshInterval]);

  return (
    <div className={`w-full relative flex justify-center px-4 lg:px-8 xl:px-16 2xl:px-24 mb-6 ${className}`}>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
            <span className="text-gray-800 font-semibold text-lg sm:text-xl lg:text-2xl">{title}</span>
          </div>

          {/* Camera Controls */}
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={isLoading} className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium">
              <FaSync className={`text-sm ${isLoading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleOpenCamera} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium">
              <FaCamera className="text-sm" />
              <span className="hidden sm:inline">Open Camera</span>
            </button>
          </div>
        </div>

        {/* Gambar Container */}
        <div className="relative group">
          <div className="relative w-full aspect-video bg-gray-900 overflow-hidden rounded-md">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm">Loading latest image...</p>
                </div>
              </div>
            ) : imageUrl ? (
              <>
                <img
                  src={`${imageUrl}?ts=${timestamp}`}
                  alt={alt}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with camera button - appears on hover (desktop only) */}
                <div className="absolute inset-0 hidden sm:flex group-hover:bg-black/20 transition-all duration-300 items-center justify-center">
                  <button
                    onClick={handleOpenCamera}
                    className="opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all duration-300 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-full p-4 border-2 border-white border-opacity-50"
                  >
                    <FaExpand className="text-2xl" />
                  </button>
                </div>

                {/* Image timestamp overlay */}
                {imageInfo.uploadTime && <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">{new Date(imageInfo.uploadTime).toLocaleString()}</div>}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">Image not found</div>
            )}
          </div>

          {/* Bottom Camera Button - Always visible on mobile */}
          <div className="absolute bottom-4 right-4 sm:hidden">
            <button onClick={handleOpenCamera} className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 active:scale-95">
              <FaCamera className="text-lg" />
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 text-sm text-gray-600">
            {/* Kiri: Info Gambar dan Status Pompa */}
            <div className="flex flex-col gap-3 w-full lg:w-2/3">
              {/* Image Info */}
              <div className="flex flex-col gap-1">
                <span>Last updated image: {new Date(timestamp).toLocaleString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}</span>
                {imageInfo.uploadTime && (
                  <span className="text-xs text-gray-500">
                    Captured: {new Date(imageInfo.uploadTime).toLocaleString('en-US', {
                      month: '2-digit',
                      day: '2-digit',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </span>
                )}
              </div>

              {/* Status Pompa */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <GiWaterDrop className={`w-4 h-4 shrink-0 ${pumpStatus.color}`} />
                  <span className="text-xs font-medium text-gray-700">Pump Status:</span>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full ${pumpStatus.bgColor}`}>
                    <span className={`text-xs font-semibold ${pumpStatus.color}`}>
                      {pumpStatus.isLoading ? (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </div>
                      ) : (
                        pumpStatus.text
                      )}
                    </span>
                  </div>
                </div>

                {!pumpStatus.isLoading && pumpStatus.fullText && pumpStatus.fullText !== "No data available" && (
                  <div className="text-xs text-gray-500 max-w-full break-words pl-6" title={pumpStatus.fullText}>
                    {pumpStatus.fullText.length > 100 ? pumpStatus.fullText.substring(0, 100) + "..." : pumpStatus.fullText}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Auto Refresh, Status, dan Forecast */}
            <div className="flex flex-col gap-3 text-left lg:text-right w-full lg:w-1/3">
              {/* Auto Refresh dan Status */}
              <div className="flex flex-col gap-1">
                <span className="text-xs">Auto refresh: {refreshInterval / 1000}s</span>
                {error ? (
                  <span className="text-xs text-red-500">{error}</span>
                ) : imageUrl && (
                  <span className="text-xs text-green-500">● Live</span>
                )}
              </div>
              
              {/* Weather Forecast */}
              <div className="border-t border-gray-300 pt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Weather Forecast</div>
                {forecastLoading ? (
                  <div className="flex items-center gap-1 text-xs text-gray-500 justify-start lg:justify-end">
                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading forecast...</span>
                  </div>
                ) : forecastData ? (
                  <div className="space-y-2">
                    {/* Weather condition */}
                    <div className="flex items-center gap-2 justify-start lg:justify-end">
                      {getWeatherIcon(forecastData.prediction)}
                      <span className={`text-xs font-medium capitalize ${getWeatherColor(forecastData.prediction)}`}>
                        {forecastData.prediction === 'No data' ? 'No data' : forecastData.prediction}
                      </span>
                    </div>
                    
                    {/* Temperature and Humidity */}
                    <div className="flex items-center gap-4 text-xs justify-start lg:justify-end">
                      <div className="flex items-center gap-1">
                        <WiThermometer className="text-orange-500 text-lg" />
                        <span className="text-gray-700">
                          {forecastData.suhu_udara ? forecastData.suhu_udara.toFixed(1) : '0.0'}°C
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <WiHumidity className="text-blue-500 text-lg" />
                        <span className="text-gray-700">
                          {forecastData.kelembaban_udara ? forecastData.kelembaban_udara.toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Forecast timestamp */}
                    <div className="text-xs text-gray-400">
                      Updated: {formatTimestamp(forecastData.timestamp)}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-left lg:text-right">No forecast data</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSnapshot;