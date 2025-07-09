import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Sprout } from "lucide-react";
import { RiDashboard3Fill } from "react-icons/ri";
import { FaUsers } from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface MobileMenuProps {
  currentPage: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ currentPage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hasAnyRole } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button onClick={toggleMenu} className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#166534] text-white rounded-lg shadow-lg hover:bg-green-700 transition-colors duration-200" aria-label={isOpen ? "Close menu" : "Open menu"}>
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Mobile Menu Overlay and Sidebar */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300" onClick={closeMenu} />

          {/* Mobile Sidebar */}
          <div className="lg:hidden fixed left-0 top-0 h-full z-50 w-72 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="bg-[#166534] text-white h-full flex flex-col">
              {/* Header with Logo */}
              <div className="flex items-center px-6 py-6 border-b border-green-600">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <span className="text-xl font-bold">Smart Farm</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                <Link href="/dashboard" onClick={closeMenu}>
                  <div
                    className={`
                      flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                      ${currentPage === "dashboard" ? "bg-[#22C55E] text-white shadow-lg" : "text-green-200 hover:bg-green-600 hover:text-white active:bg-green-700"}
                    `}
                  >
                    <div className="w-7 h-7 flex justify-center items-center mr-4">
                      <RiDashboard3Fill className="w-6 h-6" />
                    </div>
                    <span className="text-base">Dashboard</span>
                  </div>
                </Link>

                {/* Staff Management - hanya untuk admin/operator */}
                {hasAnyRole(["admin", "operator"]) && (
                  <Link href="/admin/staff" onClick={closeMenu}>
                    <div
                      className={`
                        flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200
                        ${currentPage === "admin" ? "bg-[#22C55E] text-white shadow-lg" : "text-green-200 hover:bg-green-600 hover:text-white active:bg-green-700"}
                      `}
                    >
                      <div className="w-7 h-7 flex justify-center items-center mr-4">
                        <FaUsers className="w-6 h-6" />
                      </div>
                      <span className="text-base">Staff Management</span>
                    </div>
                  </Link>
                )}
              </nav>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-green-600">
                <div className="text-green-300 text-sm">© 2025 Smart Farm</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MobileMenu;
