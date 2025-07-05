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
    <header className="bg-[#166534] text-white px-4 sm:px-6 py-3 sm:py-4 my-2 me-2 rounded-md flex justify-between items-center flex-wrap">
      {/* Judul halaman - adjust margin for mobile menu button */}
      <h1 className="text-lg sm:text-2xl font-semibold mb-2 sm:mb-0 ml-16 lg:ml-0">{title}</h1>

      {/* Profil admin */}
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 focus:outline-none">
          <span className="font-medium text-sm sm:text-base">{userName}</span>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <CircleUserRound className="w-8 h-8 text-white" />
          </div>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white rounded-md shadow-md text-sm text-green-700 z-10">
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
