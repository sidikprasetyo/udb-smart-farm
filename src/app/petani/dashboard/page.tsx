"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileMenu from "@/components/MobileMenu";
import { useAuth } from "@/contexts/AuthContext";

const PetaniDashboard = () => {
  const { userRoles, primaryRole } = useAuth();

  return (
    <MultiRoleProtectedRoute allowedRoles={["petani", "admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu for small screens */}
        <MobileMenu currentPage="petani" />

        {/* Sidebar for large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="petani" />
        </div>

        <div className="flex-1">
          <Header title="Petani Dashboard" userName="Petani" />

          <div className="p-3 sm:p-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Welcome Petani!</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">This page is accessible by petani and admin roles.</p>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm sm:text-base font-semibold text-green-800 mb-2">Your Role Information:</h3>
                <p className="text-xs sm:text-sm text-green-700">
                  Primary Role: <span className="font-semibold">{primaryRole}</span>
                </p>
                <p className="text-xs sm:text-sm text-green-700">
                  All Roles: <span className="font-semibold">{userRoles.join(", ")}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Crop Monitoring</h3>
                <p className="text-sm sm:text-base text-gray-600">Monitor your crops and farming data</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Sensor Data</h3>
                <p className="text-sm sm:text-base text-gray-600">View sensor readings from your farm</p>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Weather Info</h3>
                <p className="text-sm sm:text-base text-gray-600">Check weather conditions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default PetaniDashboard;
