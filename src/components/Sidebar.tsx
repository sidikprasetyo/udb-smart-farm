"use client";

import React, { useEffect, useState } from "react";
import { Sprout } from "lucide-react";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const [, setIsMobile] = useState(false);
  const { hasAnyRole } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`
        bg-[#166534] text-white min-h-screen rounded-md transition-all duration-300
        w-20 hover:w-60 group
        flex flex-col ms-2 me-1 my-2
      `}
    >
      {/* Logo + Brand Name */}
      <div className="flex items-center px-4 py-4 cursor-pointer overflow-hidden">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-transparent group-hover:duration-300">
          <Sprout className="w-10 h-10 text-white group-hover:text-[#86efac]" />
        </div>
        <span
          className="
            ml-1 text-2xl font-bold
            hidden group-hover:inline-block whitespace-nowrap transition-all duration-300
          "
        >
          Smart Farm
        </span>
      </div>

      {/* Navigation */}
      <div className="mt-3 flex flex-col space-y-2">
        <Link href="/dashboard" passHref>
          <button
            className={`
              flex items-center px-2 py-2 mx-4 rounded-md font-medium transition-all duration-300
              ${currentPage === "dashboard" ? "bg-[#22C55E] text-white" : "text-green-200 hover:bg-green-600"}
            `}
            title="Dashboard"
          >
            <div className="w-6 h-6 flex justify-center items-center cursor-pointer">
              <RiDashboard3Fill className="w-6 h-6 shrink-0" />
            </div>
            <span className="ml-3 hidden group-hover:inline-block  group-hover:w-38 group-hover:text-start transition-all duration-300 cursor-pointer">Dashboard</span>
          </button>
        </Link>

        {/* Staff Management - hanya untuk admin/operator */}
        {hasAnyRole(["admin", "operator"]) && (
          <Link href="/admin/staff" passHref>
            <button
              className={`
                flex items-center px-2 py-2 mx-4 rounded-md font-medium transition-all duration-300
                ${currentPage === "admin" ? "bg-[#22C55E] text-white" : "text-green-200 hover:bg-green-600"}
              `}
              title="Staff Management"
            >
              <div className="w-6 h-6 flex justify-center items-center cursor-pointer">
                <FaUsers className="w-6 h-6 shrink-0" />
              </div>
              <span className="ml-3 hidden group-hover:inline-block  group-hover:w-38 group-hover:text-start transition-all duration-300 cursor-pointer">Staff Management</span>
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
