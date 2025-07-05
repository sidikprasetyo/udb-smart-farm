"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import StaffManagement from "@/components/StaffManagement";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const AdminStaffPage = () => {
  return (
    <MultiRoleProtectedRoute allowedRoles={["admin", "operator"]}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar currentPage="admin" />
        <div className="flex-1">
          <Header title="Staff Management" userName="Admin" />
          <div className="p-6">
            <StaffManagement />
          </div>{" "}
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminStaffPage;
