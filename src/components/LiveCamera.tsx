import React from "react";

const LiveCamera: React.FC = () => {
  const cameraUrl = "http://192.168.137.138/";

  return (
    <div className="w-full flex justify-center px-4 lg:px-8 xl:px-16 2xl:px-24 mb-6">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-4 sm:p-6">
        {/* Header: Titik merah + teks */}
        <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-800 font-semibold text-lg sm:text-xl lg:text-2xl">Live Camera</span>
        </div>

        {/* Live Camera Iframe */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-black aspect-video">
          <iframe src={cameraUrl} className="w-full h-full border-none" title="Live Camera" allow="camera; microphone"></iframe>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
