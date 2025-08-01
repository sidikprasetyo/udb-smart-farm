import React, { useState, useMemo, useRef, useEffect, JSX } from "react";
import { ChevronDown } from "lucide-react";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";
import SensorPagination from "./SensorPagination";

interface HistoryItem {
  id: string | number;
  name: string;
  value: string;
  status: string;
  icon: JSX.Element;
  waktu: string;
  color: string;
}

interface Props {
  data: HistoryItem[]; // ← Data yang dipaginate (halaman aktif)
  allData: HistoryItem[]; // ← Semua data untuk filter dan export
}

const SensorHistory: React.FC<Props> = ({ allData }) => {
  const [filterOption, setFilterOption] = useState<"all" | "1d" | "3d" | "7d">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterOption]);

  // ✅ Konfigurasi range untuk setiap jenis sensor (sesuai dengan calculateStatus)
  const getSensorRange = (sensorName: string) => {
    const name = sensorName.toLowerCase();

    if (name.includes("soil") && name.includes("moisture")) {
      return { min: 0, max: 100 }; 
    } else if (name.includes("ec") && name.includes("soil")) {
      return { min: 0, max: 12 };
    } else if (name.includes("soil") && name.includes("ph")) {
      return { min: 0, max: 14 };
    } else if (name.includes("radiasi")) {
      return { min: 0, max: 1200 };
    } else if (name.includes("soil") && name.includes("temperature")) {
      return { min: 0, max: 50 };
    } else if (name.includes("air") && name.includes("temperature")) {
      return { min: 0, max: 50 };
    } else if (name.includes("air") && name.includes("humidity")) {
      return { min: 0, max: 100 };
    } else if (name.includes("wind") && name.includes("speed")) {
      return { min: 0, max: 25 };
    } else if (name.includes("rainfall")) {
      return { min: 0, max: 150 };
    } else if (name.includes("nitrogen")) {
      return { min: 0, max: 200 };
    } else if (name.includes("phosphorus")) {
      return { min: 0, max: 60 };
    } else if (name.includes("potassium")) {
      return { min: 0, max: 300 };
    } else {
      // Default range jika sensor tidak dikenali
      return { min: 0, max: 100 };
    }
  };

  // ✅ Function untuk mengkonversi nilai sensor ke persentase
  const calculateProgressPercentage = (value: string, sensorName: string) => {
    const numericValue = parseFloat(value);

    // Jika nilai bukan angka, return 0
    if (isNaN(numericValue)) return 0;

    const range = getSensorRange(sensorName);

    // Konversi nilai ke persentase berdasarkan range
    let percentage = ((numericValue - range.min) / (range.max - range.min)) * 100;

    // Pastikan persentase dalam range 0-100
    percentage = Math.max(0, Math.min(100, percentage));

    return percentage;
  };

  const getFilterLabel = (opt: string) => {
    switch (opt) {
      case "1d":
        return "Last 1 Day";
      case "3d":
        return "Last 3 Days";
      case "7d":
        return "Last 7 Days";
      default:
        return "All Data";
    }
  };

  // ✅ Perbaikan: Filter dan sort data dari terbaru ke terlama
  const filteredData = useMemo(() => {
    let filtered = [...allData]; // Create copy to avoid mutating original

    // Apply time filter
    if (filterOption !== "all") {
      const now = Date.now();
      let threshold = now;
      if (filterOption === "1d") threshold -= 24 * 60 * 60 * 1000;
      else if (filterOption === "3d") threshold -= 72 * 60 * 60 * 1000;
      else if (filterOption === "7d") threshold -= 168 * 60 * 60 * 1000;

      filtered = filtered.filter((item) => {
        const itemTime = new Date(item.waktu).getTime();
        return !isNaN(itemTime) && itemTime >= threshold;
      });
    }

    // ✅ Sort berdasarkan waktu dari terbaru ke terlama (descending)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.waktu).getTime();
      const dateB = new Date(b.waktu).getTime();

      // Handle invalid dates - put them at the end
      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      // Sort descending (terbaru dulu)
      return dateB - dateA;
    });
  }, [allData, filterOption]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const exportAllToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const exportData = filteredData.map(({ id, name, value, status, waktu }) => ({
      ID: id,
      Name: name,
      Value: value,
      Status: status,
      Timestamp: waktu,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Sensor Data");

    const today = new Date().toISOString().split("T")[0];
    const filename = `filtered-sensor-data-${today}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // ✅ Helper function untuk format tanggal yang aman
  const formatDate = (waktuString: string) => {
    try {
      const date = new Date(waktuString);
      if (isNaN(date.getTime())) {
        return { date: "Invalid Date", time: "Invalid Time" };
      }

      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return { date: formattedDate, time: formattedTime };
    } catch (error) {
      console.error("Error formatting date:", error, waktuString);
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  return (
    <div>
      {/* Filter + Export bar */}
      <div className="bg-white w-full md:w-[40vw] lg:w-[20vw] shadow-md rounded-xl p-4 mb-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Filter Dropdown */}
        <div className="relative w-full md:w-48" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-between border border-gray-300 px-4 py-2 w-full rounded-md bg-white shadow-sm hover:bg-gray-100 text-sm text-gray-700">
            {getFilterLabel(filterOption)}
            <ChevronDown className="ml-2 w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow">
              {["all", "1d", "3d", "7d"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    setFilterOption(opt as any);
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
                >
                  {getFilterLabel(opt)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Button */}
        <button onClick={exportAllToExcel} className="w-full md:w-auto flex items-center justify-center bg-[#166534] hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow">
          <RiFileExcel2Fill className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 min-h-[20vh] flex items-center justify-center">No data available for the selected time range.</div>
        ) : (
          paginatedData.map((item) => {
            // ✅ Gunakan function untuk menghitung persentase berdasarkan range sensor
            const progressValue = calculateProgressPercentage(item.value, item.name);
            const { date, time } = formatDate(item.waktu);

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl text-4xl">{item.icon}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <div className="text-base font-bold text-black">{item.value}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${item.color} transition-all duration-300`} style={{ width: `${progressValue}%` }} />
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col">
                    <span className="text-green-600 font-medium capitalize">{item.status}</span>
                    <span>
                      📅 {date} | 🕒 {time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && totalPages > 1 && <SensorPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  );
};

export default SensorHistory;
