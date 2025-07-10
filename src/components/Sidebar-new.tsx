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
    <div className="fixed top-0 left-0 z-30 bg-[#f9fafb] flex flex-col h-screen rounded-lg">
      <div className="bg-[#166534] text-white h-full rounded-lg transition-all duration-300 w-16 lg:w-20 hover:w-56 lg:hover:w-64 group flex flex-col m-2 overflow-hidden">
        {/* Logo + Brand Name */}
        <div className="flex items-center px-3 lg:px-4 py-4 lg:py-5 cursor-pointer overflow-hidden">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
            <Sprout className="w-6 h-6 lg:w-8 lg:h-8 text-white group-hover:text-[#86efac]" />
          </div>
          <span className="ml-3 text-lg lg:text-xl xl:text-2xl font-bold hidden group-hover:inline-block whitespace-nowrap transition-all duration-300">Smart Farm</span>
        </div>

        {/* Navigation */}
        <div className="mt-4 flex flex-col space-y-2">
          <Link href="/dashboard" passHref>
            <button
              className={`
                flex items-center px-1 sm:px-2 py-1.5 sm:py-2 mx-2 sm:mx-4 rounded-md font-medium transition-all duration-300
                ${currentPage === "dashboard" ? "bg-[#22C55E] text-white shadow-lg" : "text-green-200 hover:bg-green-600 hover:text-white"}
              `}
              title="Dashboard"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex justify-center items-center cursor-pointer">
                <RiDashboard3Fill className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
              </div>
              <span className="ml-2 sm:ml-3 text-sm sm:text-base hidden group-hover:inline-block group-hover:w-38 group-hover:text-start transition-all duration-300 cursor-pointer">Dashboard</span>
            </button>
          </Link>

          {/* Staff Management - hanya untuk admin/operator */}
          {hasAnyRole(["admin", "operator"]) && (
            <Link href="/admin/staff" passHref>
              <button
                className={`
                  flex items-center px-1 sm:px-2 py-1.5 sm:py-2 mx-2 sm:mx-4 rounded-md font-medium transition-all duration-300
                  ${currentPage === "admin" ? "bg-[#22C55E] text-white" : "text-green-200 hover:bg-green-600"}
                `}
                title="Staff Management"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex justify-center items-center cursor-pointer">
                  <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0" />
                </div>
                <span className="ml-2 sm:ml-3 text-sm sm:text-base hidden group-hover:inline-block group-hover:w-38 group-hover:text-start transition-all duration-300 cursor-pointer">Staff Management</span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
