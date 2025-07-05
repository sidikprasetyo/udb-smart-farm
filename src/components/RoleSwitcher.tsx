"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const RoleSwitcher = () => {
  const { userRoles, primaryRole } = useAuth();
  const [activeRole, setActiveRole] = useState<string>(primaryRole || "user");
  const router = useRouter();

  useEffect(() => {
    // Load active role from localStorage if exists
    const savedActiveRole = localStorage.getItem("activeRole");
    if (savedActiveRole && userRoles.includes(savedActiveRole)) {
      setActiveRole(savedActiveRole);
    } else if (primaryRole) {
      setActiveRole(primaryRole);
    }
  }, [primaryRole, userRoles]);

  const handleRoleSwitch = (newRole: string) => {
    if (userRoles.includes(newRole)) {
      setActiveRole(newRole);
      localStorage.setItem("activeRole", newRole);

      // Redirect to appropriate dashboard based on role
      switch (newRole) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "petani":
          router.push("/petani/dashboard");
          break;
        case "manager":
          router.push("/manager/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    }
  };

  // Don't show switcher if user has only one role
  if (userRoles.length <= 1) {
    return null;
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Switch Role</label>
      <select value={activeRole} onChange={(e) => handleRoleSwitch(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        {userRoles.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
            {role === primaryRole && " (Primary)"}
          </option>
        ))}
      </select>

      <div className="mt-2 text-xs text-gray-500">
        You have access to {userRoles.length} role{userRoles.length > 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default RoleSwitcher;
