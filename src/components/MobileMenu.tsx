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

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Hamburger Menu Button - Only visible on mobile/tablet */}
      <button onClick={toggleMenu} className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#166534] text-white rounded-lg shadow-lg hover:bg-[#1a5a3a] transition-colors" aria-label="Toggle menu">
        {isOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
      </button>

      {/* Full Screen Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50">
          <div className="fixed inset-0 bg-[#166534] text-white flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header with Logo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-green-600">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">Smart Farm</span>
              </div>
              <button onClick={toggleMenu} className="p-2 hover:bg-green-600 rounded-lg transition-colors">
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-6 py-8">
              <div className="space-y-4">
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  onClick={toggleMenu}
                  className={`
                    flex items-center px-4 py-4 rounded-lg text-lg font-medium transition-colors
                    ${currentPage === "dashboard" ? "bg-green-600 text-white" : "text-gray-200 hover:bg-green-600 hover:text-white"}
                  `}
                >
                  <RiDashboard3Fill className="w-6 h-6 mr-4" />
                  Dashboard
                </Link>

                {/* Admin Section */}
                {hasAnyRole(["admin", "operator"]) && (
                  <>
                    <div className="pt-6 pb-2">
                      <h3 className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Administration</h3>
                    </div>

                    <Link
                      href="/admin/dashboard"
                      onClick={toggleMenu}
                      className={`
                        flex items-center px-4 py-4 rounded-lg text-lg font-medium transition-colors
                        ${currentPage === "admin" ? "bg-green-600 text-white" : "text-gray-200 hover:bg-green-600 hover:text-white"}
                      `}
                    >
                      <RiDashboard3Fill className="w-6 h-6 mr-4" />
                      Admin Dashboard
                    </Link>

                    <Link
                      href="/admin/staff"
                      onClick={toggleMenu}
                      className={`
                        flex items-center px-4 py-4 rounded-lg text-lg font-medium transition-colors
                        ${currentPage === "staff" ? "bg-green-600 text-white" : "text-gray-200 hover:bg-green-600 hover:text-white"}
                      `}
                    >
                      <FaUsers className="w-6 h-6 mr-4" />
                      Staff Management
                    </Link>
                  </>
                )}

                {/* Petani Section */}
                {hasAnyRole(["petani", "admin"]) && (
                  <>
                    <div className="pt-6 pb-2">
                      <h3 className="text-xs uppercase tracking-wider text-gray-300 font-semibold">Petani</h3>
                    </div>

                    <Link
                      href="/petani/dashboard"
                      onClick={toggleMenu}
                      className={`
                        flex items-center px-4 py-4 rounded-lg text-lg font-medium transition-colors
                        ${currentPage === "petani" ? "bg-green-600 text-white" : "text-gray-200 hover:bg-green-600 hover:text-white"}
                      `}
                    >
                      <RiDashboard3Fill className="w-6 h-6 mr-4" />
                      Petani Dashboard
                    </Link>
                  </>
                )}
              </div>
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-green-600">
              <p className="text-sm text-gray-300 text-center">Smart Farm Dashboard</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
