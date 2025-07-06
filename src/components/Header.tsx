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
    <header className="bg-[#166534] text-white px-3 sm:px-4 md:px-6 py-3 sm:py-4 my-2 me-2 rounded-md flex justify-between items-center flex-wrap">
      {/* Judul halaman */}
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold mb-2 sm:mb-0">{title}</h1>

      {/* Profil admin */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-1 sm:space-x-2 focus:outline-none">
          <span className="font-medium text-xs sm:text-sm md:text-base">{userName}</span>
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <CircleUserRound className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-24 sm:w-28 md:w-32 bg-white rounded-md shadow-md text-xs sm:text-sm text-green-700 z-10">
            <a href="/profile" className="block px-4 py-2 hover:bg-green-100 hover:rounded-t-md">
              Profile
            </a>
            <button
              onClick={() => {
                setDropdownOpen(false);
                handleLogout();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-green-100 hover:rounded-b-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
