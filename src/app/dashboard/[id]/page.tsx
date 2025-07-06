"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import MobileMenu from "@/components/MobileMenu";
import SensorGraph from "@/components/Sensor/SensorGraph";
import SensorHistory from "@/components/Sensor/SensorHistory";
import SensorPagination from "@/components/Sensor/SensorPagination";

const SensorDetailPage = () => {
  const { id: sensorId } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(8); // Bisa diubah sesuai keinginan
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Dummy semua data
  const allData = Array.from({ length: 75 }, (_, i) => ({
    id: i + 1,
    name: "Soil Moisture",
    value: "72%",
    status: "Optimal",
    icon: "💧",
    timestamp: "10-12-2025 | 01:45",
  }));

  useEffect(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setHistoryData(allData.slice(startIndex, endIndex));
  }, [currentPage]);

  return (
    <MultiRoleProtectedRoute allowedRoles={["user", "operator", "petani", "manager"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu */}
        <MobileMenu currentPage="dashboard" />

        {/* Sidebar - Hidden on mobile, show on tablet+ */}
        <div className="hidden lg:block">
          <Sidebar currentPage="dashboard" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header title="Dashboard" userName="Admin" />
          
          {/* Content Container with responsive padding */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12 bg-gray-50 min-h-screen">
            
            {/* Sensor Graph Container */}
            <div className="mb-4 md:mb-6 lg:mb-8">
              <div className="w-full max-w-full overflow-hidden">
                <SensorGraph title={sensorId as string} />
              </div>
            </div>
            
            {/* History and Pagination Container */}
            <div className="space-y-4 md:space-y-6">
              <div className="w-full overflow-x-auto">
                <SensorHistory data={historyData} />
              </div>
              
              <div className="flex justify-center">
                <SensorPagination 
                  currentPage={currentPage} 
                  totalPages={Math.ceil(allData.length / recordsPerPage)} 
                  onPageChange={setCurrentPage} 
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
