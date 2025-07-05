"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

const AdminDashboard = () => {
  const { userRoles, primaryRole } = useAuth();

  return (
    <MultiRoleProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentPage="admin" />

        <div className="flex-1">
          <Header title="Admin Dashboard" userName="Admin" />

          <div className="p-6">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Admin!</h2>
              <p className="text-gray-600 mb-4">This page is only accessible by users with admin role.</p>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Your Role Information:</h3>
                <p className="text-blue-700">
                  Primary Role: <span className="font-semibold">{primaryRole}</span>
                </p>
                <p className="text-blue-700">
                  All Roles: <span className="font-semibold">{userRoles.join(", ")}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">User Management</h3>
                <p className="text-gray-600">Manage system users and their roles</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">System Settings</h3>
                <p className="text-gray-600">Configure system-wide settings</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Reports</h3>
                <p className="text-gray-600">View detailed system reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminDashboard;
