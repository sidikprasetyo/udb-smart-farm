import React, { useState, useRef, useEffect } from "react";
import { CircleUserRound } from "lucide-react";
import useLogout from "@/hooks/useLogout";

interface HeaderProps {
  title: string;
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ title, userName }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { handleLogout } = useLogout();

  // Close dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-[#166534] text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-1 my-2 ms-2 lg:ms-4 me-2 rounded-lg ">
      <div className="flex justify-between items-center">
        {/* Judul halaman */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-xl md:text-2xl font-semibold truncate pr-4">{title}</h1>
        </div>

        {/* Profil admin */}
        <div className="relative flex-shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 sm:space-x-3 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-lg p-1 sm:p-2 hover:bg-green-700 transition-colors duration-200"
          >
            <span className="font-medium text-sm sm:text-base hidden xs:block max-w-[100px] sm:max-w-[150px] truncate">{userName}</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#166534] bg-opacity-20 rounded-full flex items-center justify-center ring-2 ring-white ring-opacity-30">
              <CircleUserRound className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white rounded-lg shadow-xl border border-gray-200 text-gray-700 z-50 overflow-hidden">
              <div className="py-1">
                <div className="block sm:hidden px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">{userName}</div>
                <a href="/profile" className="block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition-colors duration-150">
                  Profile
                </a>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
