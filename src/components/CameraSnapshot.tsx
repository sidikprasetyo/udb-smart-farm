"use client";

import { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";

const CameraSnapshot = ({ alt = "Camera Snapshot", refreshInterval = 5000, title = "ESP32 Snapshot", className = "" }) => {
  const [imageUrl, setImageUrl] = useState("");
  const [timestamp, setTimestamp] = useState(Date.now());

  // Ambil nama file terbaru
  const fetchLatestImage = async () => {
    try {
      const res = await fetch("/api/latest-image");
      if (!res.ok) throw new Error("Network response not ok");

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        console.warn("No imageUrl in response");
      }
    } catch (err) {
      console.error("Failed to fetch latest image:", err);
    }
  };

  useEffect(() => {
    fetchLatestImage(); // Saat pertama
    const interval = setInterval(() => {
      setTimestamp(Date.now());
      fetchLatestImage(); // Update berkala
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className={`w-full relative flex justify-center px-4 lg:px-8 xl:px-16 2xl:px-24 mb-6 ${className}`}>
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-800 font-semibold text-lg sm:text-xl lg:text-2xl">{title}</span>
        </div>

        {/* Gambar */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-300 bg-black">
          {imageUrl ? <img src={`${imageUrl}?ts=${timestamp}`} alt={alt} className="absolute top-0 left-0 w-full h-full object-cover" /> : <div className="text-white flex items-center justify-center h-full">Loading image...</div>}
        </div>
      </div>
      <div className="manual-capture-wrapper z-10 font-bold text-center mt-4 text-black absolute bottom-0">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-4xl py-2 px-4 rounded shadow cursor-pointer">
          <FaCamera />
        </button>
      </div>
    </div>
  );
};

export default CameraSnapshot;
