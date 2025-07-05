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
        {/* Mobile Menu for small screens */}
        <MobileMenu currentPage="dashboard" />

        {/* Sidebar for large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="dashboard" />
        </div>

        <div className="flex-1">
          <Header title="Dashboard" userName="Admin" />
          <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-wrap items-center justify-center mb-4 gap-2">
              <SensorGraph title={sensorId as string} />
            </div>
            <SensorHistory data={historyData} />
            <SensorPagination currentPage={currentPage} totalPages={Math.ceil(allData.length / recordsPerPage)} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default SensorDetailPage;
