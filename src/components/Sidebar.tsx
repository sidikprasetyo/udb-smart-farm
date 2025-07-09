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
    <div className="fixed top-0 left-0 z-30 bg-white shadow-lg flex flex-col h-screen border-r border-gray-200">
      <div className="bg-[#166534] text-white h-full rounded-lg transition-all duration-300 w-16 lg:w-20 hover:w-56 lg:hover:w-64 group flex flex-col m-2 overflow-hidden">
        {/* Logo + Brand Name */}
        <div className="flex items-center px-3 lg:px-4 py-4 lg:py-5 cursor-pointer overflow-hidden flex-shrink-0">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-500 rounded-lg flex items-center justify-center group-hover:bg-transparent transition-all duration-300">
            <Sprout className="w-6 h-6 lg:w-8 lg:h-8 text-white group-hover:text-[#86efac]" />
          </div>
          <span className="ml-3 text-lg lg:text-xl xl:text-2xl font-bold hidden group-hover:inline-block whitespace-nowrap transition-all duration-300">Smart Farm</span>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          <Link href="/dashboard" passHref>
            <button
              className={`
                flex items-center px-2 lg:px-3 py-2.5 lg:py-3 mx-3 lg:mx-4 rounded-lg font-medium transition-all duration-300 w-auto
                ${currentPage === "dashboard" ? "bg-[#22C55E] text-white shadow-lg" : "text-green-200 hover:bg-green-600 hover:text-white"}
              `}
              title="Dashboard"
            >
              <div className="w-6 h-6 lg:w-7 lg:h-7 flex justify-center items-center flex-shrink-0">
                <RiDashboard3Fill className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="ml-3 text-sm lg:text-base hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap">Dashboard</span>
            </button>
          </Link>

          {/* Staff Management - hanya untuk admin/operator */}
          {hasAnyRole(["admin", "operator"]) && (
            <Link href="/admin/staff" passHref>
              <button
                className={`
                  flex items-center px-2 lg:px-3 py-2.5 lg:py-3 mx-3 lg:mx-4 rounded-lg font-medium transition-all duration-300 w-auto
                  ${currentPage === "admin" ? "bg-[#22C55E] text-white shadow-lg" : "text-green-200 hover:bg-green-600 hover:text-white"}
                `}
                title="Staff Management"
              >
                <div className="w-6 h-6 lg:w-7 lg:h-7 flex justify-center items-center flex-shrink-0">
                  <FaUsers className="w-5 h-5 lg:w-6 lg:h-6" />
                </div>
                <span className="ml-3 text-sm lg:text-base hidden group-hover:inline-block transition-all duration-300 whitespace-nowrap">Staff Management</span>
              </button>
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
