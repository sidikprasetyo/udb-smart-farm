"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MobileMenu from "@/components/MobileMenu";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { userRoles, primaryRole } = useAuth();

  return (
    <MultiRoleProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu */}
        <MobileMenu currentPage="admin" />

        {/* Sidebar - Fixed on large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="admin" />
        </div>

        {/* Main Content - Add left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col lg:ml-20 transition-all duration-300">
          <Header title="Admin Dashboard" userName="Admin" />

          {/* Content Container with responsive padding */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {/* Welcome Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6 lg:mb-8">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 mb-4">Welcome Admin!</h2>
              <p className="text-base lg:text-lg text-gray-600 mb-6">This page is only accessible by users with admin role.</p>

              {/* Role Information Card */}
              <div className="bg-blue-50 p-4 lg:p-6 rounded-lg">
                <h3 className="text-base lg:text-lg font-semibold text-blue-800 mb-2">Your Role Information:</h3>
                <div className="space-y-2">
                  <p className="text-sm lg:text-base text-blue-700">
                    Primary Role: <span className="font-semibold">{primaryRole}</span>
                  </p>
                  <p className="text-sm lg:text-base text-blue-700">
                    All Roles: <span className="font-semibold">{userRoles.join(", ")}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">User Management</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Manage system users and their roles</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">System Settings</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Configure system-wide settings</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Reports</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">View detailed system reports</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Monitor system performance</p>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-2">Monitoring</h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">Real-time system monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminDashboard;
