"use client";

import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import StaffManagement from "@/components/StaffManagement";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar-new";
import MobileMenu from "@/components/MobileMenu";

const AdminStaffPage = () => {
  return (
    <MultiRoleProtectedRoute allowedRoles={["admin", "operator"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Mobile Menu */}
        <MobileMenu currentPage="admin" />

        {/* Sidebar - Fixed on large screens */}
        <div className="hidden lg:block">
          <Sidebar currentPage="admin" />
        </div>

        {/* Main Content - Add left margin to account for fixed sidebar */}
        <div className="flex-1 flex flex-col lg:ml-20 transition-all duration-300">
          <Header title="Staff Management" userName="Admin" />

          {/* Content Container with responsive padding */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <StaffManagement />
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminStaffPage;
