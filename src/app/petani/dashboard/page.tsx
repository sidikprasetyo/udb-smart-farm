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
        {/* Mobile Menu */}
        <MobileMenu currentPage="petani" />

        {/* Sidebar - Fixed on large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="petani" />
        </div>

        {/* Main Content - Add left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col lg:ml-20 transition-all duration-300">
          <Header title="Petani Dashboard" userName="Petani" />

          {/* Content Container with responsive padding */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 md:p-8 lg:p-10 mb-4 sm:mb-6 md:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Welcome Petani!</h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6">This page is accessible by petani and admin roles.</p>

              {/* Role Information Card */}
              <div className="bg-green-50 p-3 sm:p-4 md:p-6 rounded-lg">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-green-800 mb-2">Your Role Information:</h3>
                <div className="space-y-1 sm:space-y-2">
                  <p className="text-xs sm:text-sm md:text-base text-green-700">
                    Primary Role: <span className="font-semibold">{primaryRole}</span>
                  </p>
                  <p className="text-xs sm:text-sm md:text-base text-green-700">
                    All Roles: <span className="font-semibold">{userRoles.join(", ")}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Crop Monitoring</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Monitor your crops and farming data</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Sensor Data</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">View sensor readings from your farm</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Weather Info</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Check weather conditions</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Irrigation</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Control irrigation systems</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Alerts</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">View farm alerts and notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default PetaniDashboard;
