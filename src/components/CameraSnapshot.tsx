"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaCamera, FaExpand, FaSync } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebaseConfig";
import { GiWaterDrop } from "react-icons/gi";
import Image from "next/image";

interface CameraSnapshotProps {
  alt?: string;
  refreshInterval?: number;
  title?: string;
  className?: string;
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
  const router = useRouter();

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

    const interval = setInterval(() => {
      setTimestamp(Date.now());
      fetchLatestImage(); // Update berkala
    }, refreshInterval);

    return () => clearInterval(interval);
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
              <span className="hidden sm:inline">Buka Kamera</span>
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
                  <p className="text-sm">Memuat gambar terbaru...</p>
                </div>
              </div>
            ) : imageUrl ? (
              <>
                <Image src={`${imageUrl}?ts=${timestamp}`} alt={alt} fill className="object-cover" />

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
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">Gambar tidak tersedia</div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-gray-600">
            {/* Kiri: Info Gambar dan Status Pompa */}
            <div className="flex flex-col gap-2 w-full sm:w-2/3">
              <div className="flex flex-col gap-1">
                <span>Last updated image: {new Date(timestamp).toLocaleTimeString()}</span>

                {/* {imageInfo.fileName && (
                    <span className="text-xs text-gray-500">
                      File: {imageInfo.fileName}
                      {imageInfo.fileSize && ` (${(imageInfo.fileSize / 1024).toFixed(1)} KB)`}
                    </span>
                  )} */}

                {imageInfo.uploadTime && <span className="text-xs text-gray-500">Captured: {new Date(imageInfo.uploadTime).toLocaleString()}</span>}
              </div>

              {/* Status Pompa */}
              <div className="flex flex-wrap items-start gap-0 sm:gap-2 sm:items-center sm:flex-nowrap">
                <div className="flex items-center gap-1 sm:gap-2 min-h-[1.25rem]">
                  <GiWaterDrop className={`w-4 h-4 shrink-0 ${pumpStatus.color}`} />
                  <span className="text-xs font-medium text-gray-700 whitespace-nowrap leading-none">Pump Status:</span>
                </div>
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

                {!pumpStatus.isLoading && pumpStatus.fullText && pumpStatus.fullText !== "No data available" && (
                  <div className="text-xs text-gray-500 max-w-full break-words sm:max-w-xs sm:mt-0 mt-1" title={pumpStatus.fullText}>
                    {pumpStatus.fullText.length > 80 ? pumpStatus.fullText.substring(0, 80) + "..." : pumpStatus.fullText}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Auto Refresh dan Status */}
            <div className="flex flex-col gap-1 text-left sm:text-right w-full sm:w-auto">
              <span className="text-xs">Auto refresh: {refreshInterval / 1000}s</span>
              {error ? <span className="text-xs text-red-500">{error}</span> : imageUrl && <span className="text-xs text-green-500">● Live</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraSnapshot;
