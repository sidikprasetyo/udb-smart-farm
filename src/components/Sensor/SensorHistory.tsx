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
  timestamp: string;
  color: string;
}

interface Props {
  data: HistoryItem[];       // ← Data yang dipaginate (halaman aktif)
  allData: HistoryItem[];    // ← Semua data untuk filter dan export
}

const SensorHistory: React.FC<Props> = ({ allData }) => {
  const [filterOption, setFilterOption] = useState<"all" | "6h" | "12h" | "24h">("all");
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

  const getFilterLabel = (opt: string) => {
    switch (opt) {
      case "6h": return "Last 6 Hours";
      case "12h": return "Last 12 Hours";
      case "24h": return "Last 24 Hours";
      default: return "All Data";
    }
  };

  const filteredData = useMemo(() => {
    if (filterOption === "all") return allData;

    const now = Date.now();
    let threshold = now;
    if (filterOption === "6h") threshold -= 6 * 60 * 60 * 1000;
    else if (filterOption === "12h") threshold -= 12 * 60 * 60 * 1000;
    else if (filterOption === "24h") threshold -= 24 * 60 * 60 * 1000;

    return allData.filter((item) => new Date(item.timestamp).getTime() >= threshold);
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

    const exportData = filteredData.map(({ id, name, value, status, timestamp }) => ({
      ID: id,
      Name: name,
      Value: value,
      Status: status,
      Timestamp: timestamp,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Sensor Data");

    const today = new Date().toISOString().split("T")[0];
    const filename = `filtered-sensor-data-${today}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div>
      {/* Filter + Export bar */}
      <div className="bg-white w-[20vw] shadow-md rounded-xl p-4 mb-4 flex flex-col justify-center md:flex-row items-start md:items-center gap-4">
        {/* Filter Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center border border-gray-300 px-4 py-2 w-[10vw] justify-between rounded-md bg-white shadow-sm hover:bg-gray-100 text-sm text-gray-700"
          >
            {getFilterLabel(filterOption)}
            <ChevronDown className="ml-2 w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-40 bg-white border border-gray-200 rounded shadow">
              {["all", "6h", "12h", "24h"].map((opt) => (
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
        <button
          onClick={exportAllToExcel}
          className="flex items-center bg-[#166534] hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
        >
          <RiFileExcel2Fill className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 min-h-[20vh] flex items-center justify-center">
            No data available for the selected time range.
          </div>
        ) : (
          paginatedData.map((item) => {
            const progressValue = !isNaN(parseFloat(item.value)) ? parseFloat(item.value) : 0;

            return (
              <div key={item.id} className="bg-white rounded-2xl shadow p-4 flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl text-4xl">
                  {item.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <div className="text-base font-bold text-black">{item.value}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 flex flex-col">
                    <span className="text-green-600 font-medium">{item.status}</span>
                    <span>At {item.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && totalPages > 1 && (
        <SensorPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default SensorHistory;
