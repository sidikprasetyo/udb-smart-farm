"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import StaffManagement from "@/components/StaffManagement";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileMenu from "@/components/MobileMenu";

const AdminStaffPage = () => {
  return (
    <MultiRoleProtectedRoute allowedRoles={["admin", "operator"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu for small screens */}
        <MobileMenu currentPage="admin" />

        {/* Sidebar for large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="admin" />
        </div>

        <div className="flex-1">
          <Header title="Staff Management" userName="Admin" />
          <div className="p-3 sm:p-6">
            <StaffManagement />
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminStaffPage;
