"use client";

import { useState, useEffect } from "react";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import StaffManagement from "@/components/StaffManagement";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar-new";
import MobileMenu from "@/components/MobileMenu";
import { firestore, auth } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

const AdminStaffPage = () => {
  const [user, loading] = useAuthState(auth);
  const [userName, setUserName] = useState<string>("Loading...");

  // ✅ Fetch username berdasarkan user yang login
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || loading) return;

      try {
        const userDocRef = doc(firestore, "staff", user.email || "");
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.username || userData.email || "Admin");
        } else {
          // Jika tidak ditemukan di collection staff, gunakan email
          setUserName(user.email?.split("@")[0] || "Admin");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUserName(user.email?.split("@")[0] || "Admin");
      }
    };

    fetchUserData();
  }, [user, loading]);

  // Show loading state while authenticating
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
          <Header title="Staff Management" userName={userName} />

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