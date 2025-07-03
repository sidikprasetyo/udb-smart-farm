import React from 'react';

const LiveCamera: React.FC = () => {
  const cameraUrl = "http://192.168.171.79/"; 

  return (
    <div className="w-full flex justify-center px-1 sm:px-1 lg:px-[25%] mb-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        {/* Header: Titik merah + teks */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-800 font-semibold text-base sm:text-lg">
            Live Camera
          </span>
        </div>

        {/* Live Camera Iframe */}
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-black">
          <iframe
            src={cameraUrl}
            className="w-full h-[200px] sm:h-[300px] border-none"
            title="Live Camera"
            allow="camera; microphone"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default LiveCamera;
