import React, { useState, useEffect } from 'react';
import { Sprout, CircleGauge } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  currentPage: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const [expanded, setExpanded] = useState(true);
  const [, setIsMobile] = useState(false);

  // Responsif berdasarkan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // < md (768px)
      if (window.innerWidth < 768) setExpanded(false); // collapse di mobile
    };

    handleResize(); // jalankan saat pertama kali load
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`bg-[#166534] text-white min-h-screen rounded-md transition-all duration-300
      ${expanded ? 'w-60' : 'w-20'} flex flex-col ms-2 me-1 my-2`}
    >
      {/* Logo + Toggle */}
      <div
        className="flex items-center px-4 py-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        {expanded && <span className="ml-3 text-xl font-bold">Smart Farm</span>}
      </div>

      {/* Navigasi */}
      <Link href="/dashboard" passHref>
      <div className="mt-3 flex flex-col space-y-2">
        <button
          className={`flex items-center ${
            expanded ? 'justify-start space-x-3' : 'justify-center'
          } px-4 py-3 mx-4 rounded-md font-medium transition-colors
          ${currentPage === 'dashboard' ? 'bg-[#22C55E] text-white' : 'text-green-200 hover:bg-green-600'}
        `}
          title="Dashboard"
        >
          <CircleGauge className="w-5 h-5 cursor-pointer" />
          {expanded && <span className='cursor-pointer'>Dashboard</span>}
        </button>

      </div>
      </Link>
    </div>
  );
};

export default Sidebar;
