import React, { useState, useMemo, useRef, useEffect, JSX } from "react";
import { ChevronDown, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight } from "lucide-react";
import { RiFileExcel2Fill } from "react-icons/ri";
import * as XLSX from "xlsx";

// Custom Toast Component
interface ToastProps {
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ type, title, message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className={`max-w-md w-full min-w-[350px] border rounded-lg shadow-lg p-4 ${getToastStyle()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// SensorPagination Component
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const SensorPagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 border-2 border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white shadow-sm"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-sm font-medium text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 border-2 border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 bg-white shadow-sm"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

interface HistoryItem {
  id: string | number;
  name: string;
  value: string;
  status: string;
  icon: JSX.Element;
  waktu: string;
  color: string;
  timestamp?: string;
  created_at?: string;
  updatedAt?: string;
  createdAt?: string;
  date?: string;
  time?: string;
  [key: string]: unknown;
}

interface Props {
  data: HistoryItem[];
  allData: HistoryItem[];
}

type FilterOption = "all" | "1d" | "3d" | "7d";

const SensorHistory: React.FC<Props> = ({ allData }) => {
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [allSensorData, setAllSensorData] = useState<HistoryItem[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toast state
  const [toast, setToast] = useState<{
    isVisible: boolean;
    type: 'success' | 'error' | 'warning';
    title: string;
    message: string;
  }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: ''
  });

  const showToast = (type: 'success' | 'error' | 'warning', title: string, message: string) => {
    setToast({
      isVisible: true,
      type,
      title,
      message
    });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterOption]);

  useEffect(() => {
    const fetchAllSensors = async () => {
      try {
        const res = await fetch("/api/sensors/all");
        const data = await res.json();
        setAllSensorData(data);
      } catch {
        showToast('error', 'Fetch Error', 'Failed to fetch sensor data from server');
      }
    };

    fetchAllSensors();
  }, []);

  const beautifySensorName = (key: string): string => {
    const map: Record<string, string> = {
      Date: "Tanggal",
      Time: "Waktu",
      ph_tanah: "pH Tanah",
      ec_tanah: "EC Tanah",
      kelembaban_tanah: "Kelembaban Tanah (%RH)",
      suhu_tanah: "Suhu Tanah (°C)",
      suhu_udara: "Suhu Udara (°C)",
      kelembaban_udara: "Kelembaban Udara (%RH)",
      kecepatan_angin: "Kecepatan Angin (m/s)",
      curah_hujan: "Curah Hujan (mm)",
      radiasi: "Radiasi (W/m²)",
      nitrogen: "Nitrogen (mg/kg)",
      phosphorus: "Phosphorus (mg/kg)",
      kalium: "Kalium (mg/kg)",
      soil_ph: "pH Tanah",
      soil_ec: "EC Tanah", 
      soil_moisture: "Kelembaban Tanah (%RH)",
      soil_temperature: "Suhu Tanah (°C)",
      air_temperature: "Suhu Udara (°C)",
      air_humidity: "Kelembaban Udara (%RH)",
      wind_speed: "Kecepatan Angin (m/s)",
      rainfall: "Curah Hujan (mm)",
      radiation: "Radiasi (W/m²)",
      potassium: "Kalium (mg/kg)",
    };

    return map[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const parseCustomDate = (dateString: string): Date => {
    try {
      const ddmmyyyyPattern = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(\s+\d{1,2}:\d{1,2}:\d{1,2})?$/;
      const match = dateString.match(ddmmyyyyPattern);
      
      if (match) {
        const [, day, month, year, time] = match;
        const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${time || ' 00:00:00'}`;
        return new Date(isoString);
      }
      
      return new Date(dateString);
    } catch {
      return new Date(dateString);
    }
  };

  const exportToExcel = (type: "filtered" | "all") => {
    if (type === "filtered") {
      if (filteredData.length === 0) {
        showToast('warning', 'No Data', 'No filtered data available to export');
        return;
      }

      const exportData = filteredData.map(({ waktu, name, value, status }) => {
        const parsedDate = parseCustomDate(waktu);
        const formattedDate = parsedDate.toLocaleDateString("en-GB");
        const formattedTime = parsedDate.toLocaleTimeString("en-GB", { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        return {
          Date: formattedDate,
          Time: formattedTime,
          Name: name,
          Value: value,
          Status: status,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `filtered-sensor-data`);

      const today = new Date().toISOString().split("T")[0];
      const filename = `filtered-sensor-data-${today}.xlsx`;
      XLSX.writeFile(workbook, filename);

      showToast('success', 'Export Successful', `Filtered data exported as ${filename}`);

    } else if (type === "all") {
      if (allSensorData.length === 0) {
        showToast('warning', 'No Data', 'No sensor data available to export');
        return;
      }

      let dataToExport = [...allSensorData];
      if (filterOption !== "all") {
        const now = Date.now();
        let threshold = now;

        if (filterOption === "1d") threshold -= 1 * 24 * 60 * 60 * 1000;
        else if (filterOption === "3d") threshold -= 3 * 24 * 60 * 60 * 1000;
        else if (filterOption === "7d") threshold -= 7 * 24 * 60 * 60 * 1000;

        dataToExport = dataToExport.filter((item) => {
          const possibleTimeFields = [
            item.waktu, 
            item.timestamp, 
            item.created_at, 
            item.updatedAt, 
            item.createdAt,
            item.date,
            item.time
          ];
          
          let timeField: string | undefined = undefined;
          for (const field of possibleTimeFields) {
            if (field) {
              timeField = field as string;
              break;
            }
          }

          if (!timeField) {
            return false;
          }

          const time = parseCustomDate(timeField).getTime();
          const isValidTime = !isNaN(time);
          const isWithinRange = time >= threshold;
          
          return isValidTime && isWithinRange;
        });
      }

      if (dataToExport.length === 0) {
        showToast('warning', 'No Data Found', `No data available for the selected time range (${getFilterLabel(filterOption)})`);
        return;
      }

      dataToExport = dataToExport.sort((a, b) => {
        const getTimeField = (item: HistoryItem) => {
          return item.waktu || item.timestamp || item.created_at || item.updatedAt || item.createdAt || item.date || item.time;
        };
        
        const timeFieldA = getTimeField(a);
        const timeFieldB = getTimeField(b);
        
        if (!timeFieldA || !timeFieldB) return 0;
        
        const dateA = parseCustomDate(timeFieldA as string).getTime();
        const dateB = parseCustomDate(timeFieldB as string).getTime();

        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;

        return dateB - dateA;
      });

      const exportData = dataToExport.map((item) => {
        const { waktu, timestamp, created_at, updatedAt, createdAt, date, time, ...sensors } = item;
        const timeField = waktu || timestamp || created_at || updatedAt || createdAt || date || time;

        const parsedDate = parseCustomDate(timeField as string);
        const formattedDate = parsedDate.toLocaleDateString("en-GB");
        const formattedTime = parsedDate.toLocaleTimeString("en-GB", { 
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        return {
          Date: formattedDate,
          Time: formattedTime,
          ...sensors,
        };
      });

      const headers = Object.keys(exportData[0]).map((key) => beautifySensorName(key));

      const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: Object.keys(exportData[0]),
      });

      XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `all-sensor-data`);

      const today = new Date().toISOString().split("T")[0];
      const filterSuffix = filterOption !== "all" ? `-${filterOption}` : "";
      const filename = `all-sensor-data${filterSuffix}-${today}.xlsx`;
      XLSX.writeFile(workbook, filename);

      showToast('success', 'Export Successful', `All sensor data exported as ${filename}`);
    }
  };

  const getSensorRange = (sensorName: string) => {
    const name = sensorName.toLowerCase();

    if (name.includes("soil") && name.includes("moisture")) {
      return { min: 0, max: 100 }; 
    } else if (name.includes("ec") && name.includes("soil")) {
      return { min: 0, max: 4000 };
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
      return { min: 0, max: 100 };
    }
  };

  const calculateProgressPercentage = (value: string, sensorName: string) => {
    const numericValue = parseFloat(value);

    if (isNaN(numericValue)) return 0;

    const range = getSensorRange(sensorName);
    let percentage = ((numericValue - range.min) / (range.max - range.min)) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    return percentage;
  };

  // Fixed function to get unit based on sensor name
  const getSensorUnit = (sensorName: string): string => {
    const name = sensorName.toLowerCase();
    
    // Check for specific patterns in sensor name
    if (name.includes('ph')) return '';
    if (name.includes('ec')) return ' μS/cm';
    if (name.includes('kelembaban') || name.includes('moisture') || name.includes('humidity')) return ' %RH';
    if (name.includes('suhu') || name.includes('temperature')) return ' °C';
    if (name.includes('kecepatan') || name.includes('wind') || name.includes('speed')) return ' m/s';
    if (name.includes('curah') || name.includes('rainfall') || name.includes('hujan')) return ' mm';
    if (name.includes('radiasi') || name.includes('radiation')) return ' W/m²';
    if (name.includes('nitrogen') || name.includes('phosphorus') || name.includes('kalium') || name.includes('potassium')) return ' mg/kg';
    
    // Fallback - check exact matches (case insensitive)
    const exactMatches: { [key: string]: string } = {
      'curah_hujan': ' mm',
      'kelembaban_udara': ' %RH',
      'suhu_udara': ' °C',
      'kecepatan_angin': ' m/s',
      'ec_tanah': ' μS/cm',
      'kelembaban_tanah': ' %RH',
      'ph_tanah': '',
      'radiasi': ' W/m²',
      'suhu_tanah': ' °C',
      'nitrogen': ' mg/kg',
      'phosphorus': ' mg/kg',
      'kalium': ' mg/kg',
    };
    
    return exactMatches[name] || '';
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

  const filteredData = useMemo(() => {
    let filtered = [...allData];

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

    return filtered.sort((a, b) => {
      const dateA = new Date(a.waktu).getTime();
      const dateB = new Date(b.waktu).getTime();

      if (isNaN(dateA) && isNaN(dateB)) return 0;
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;

      return dateB - dateA;
    });
  }, [allData, filterOption]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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
    } catch {
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  return (
    <div>
      <Toast
        type={toast.type}
        title={toast.title}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />

      <div className="bg-white w-full md:w-[40vw] lg:w-[22vw] shadow-md rounded-xl p-4 mb-4 flex flex-row items-start md:items-center gap-4">
        <div className="relative w-full md:w-48" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center justify-between border border-gray-300 px-4 py-2 w-full rounded-md bg-white shadow-sm hover:bg-gray-100 text-sm text-gray-700">
            {getFilterLabel(filterOption)}
            <ChevronDown className="ml-2 w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow">
              {(["all", "1d", "3d", "7d"] as FilterOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setFilterOption(opt);
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

        <div className="relative w-full md:w-auto" ref={exportRef}>
          <button
            onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            className="w-full md:w-auto flex items-center justify-center bg-[#166534] hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow"
          >
            <RiFileExcel2Fill className="w-4 h-4 mr-2" />
            Export
            <ChevronDown className="ml-2 w-4 h-4" />
          </button>

          {exportDropdownOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded shadow">
              <button
                onClick={() => {
                  exportToExcel("filtered");
                  setExportDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Export Filtered Data
              </button>
              <button
                onClick={() => {
                  exportToExcel("all");
                  setExportDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
              >
                Export All Data
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
        {filteredData.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 min-h-[20vh] flex items-center justify-center">
            No data available for the selected time range.
          </div>
        ) : (
          paginatedData.map((item) => {
            const progressValue = calculateProgressPercentage(item.value, item.name);
            const { date, time } = formatDate(item.waktu);
            
            // Use the new getSensorUnit function
            const unit = getSensorUnit(item.name);

            let statusColor = "text-gray-500";
            let badgeColor = "bg-gray-200";
            if (item.status === "low") {
              statusColor = "text-yellow-600";
              badgeColor = "bg-yellow-100 text-yellow-700";
            } else if (item.status === "normal") {
              statusColor = "text-green-600";
              badgeColor = "bg-green-100 text-green-700";
            } else if (item.status === "high") {
              statusColor = "text-red-600";
              badgeColor = "bg-red-100 text-red-700";
            }

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-md p-4 flex items-start gap-4 hover:shadow-lg transition duration-300"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 text-3xl">
                  {item.icon}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  </div>
                  <p className="text-lg font-bold text-black">
                    {parseFloat(item.value).toFixed(1)}{unit}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-300`}
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                    <div className={statusColor}>🛈 Status: <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor} capitalize`}>{item.status}</span></div>
                    <div>📅 {date} | 🕒 {time}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredData.length > 0 && totalPages > 1 && <SensorPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
    </div>
  );
};

export default SensorHistory;