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
        {/* Mobile Menu */}
        <MobileMenu currentPage="admin" />

        {/* Sidebar - Hidden on mobile, show on tablet+ */}
        <div className="hidden lg:block">
          <Sidebar currentPage="admin" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header title="Staff Management" userName="Admin" />
          
          {/* Content Container with responsive padding */}
          <div className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 2xl:p-12">
            <StaffManagement />
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AdminStaffPage;
