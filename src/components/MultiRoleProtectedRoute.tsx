"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface MultiRoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  requireAll?: boolean; // true = butuh semua role, false = salah satu saja
}

const MultiRoleProtectedRoute: React.FC<MultiRoleProtectedRouteProps> = ({ children, allowedRoles, requireAll = false }) => {
  const { user, userRoles, hasRole, hasAnyRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if user is not authenticated
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  // Cek akses berdasarkan requireAll
  const hasAccess = requireAll
    ? allowedRoles.every((role) => hasRole(role)) // Butuh semua role
    : hasAnyRole(allowedRoles); // Salah satu role saja

  // Show access denied if user doesn't have required roles
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required roles: {allowedRoles.join(requireAll ? " AND " : " OR ")}</p>
          <p className="text-sm text-gray-500">Your roles: {userRoles.join(", ") || "None"}</p>
          <button onClick={() => router.push("/dashboard")} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render children if user has required roles
  return <>{children}</>;
};

export default MultiRoleProtectedRoute;
