import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mapping warna sesuai sensorId
const colorMap: { [key: string]: string } = {
  kelembaban_tanah: "#16a34a",    // bg-green-600
  ph_tanah: "#9333ea",            // bg-purple-500
  curah_hujan: "#2563eb",         // bg-blue-600
  kecepatan_angin: "#60a5fa",     // bg-blue-400
  suhu_tanah: "#ef4444",          // bg-red-500
  suhu_udara: "#f97316",          // bg-orange-500
  kelembaban_udara: "#06b6d4",    // bg-cyan-500
  radiasi: "#facc15",             // bg-yellow-500
  nitrogen: "#3b82f6",            // bg-blue-500
  phosphorus: "#8b5cf6",          // bg-purple-500
  kalium: "#f59e0b",              // bg-yellow-600
  ec_tanah: "#22d3ee",            // bg-cyan-400
};

interface SensorGraphProps {
  title: string;
  data: {
    waktu: string;
    value: number;
  }[];
  sensorId: string;
}

const SensorGraph: React.FC<SensorGraphProps> = ({ title, data, sensorId }) => {
  // ✅ Perbaikan: Format waktu dengan parameter yang benar
  const formatTimeOnly = (waktuString: string) => {
    try {
      // Parse waktu string menjadi Date object
      const date = new Date(waktuString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", waktuString);
        return "Invalid";
      }
      
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error, waktuString);
      return "Error";
    }
  };

  // ✅ Transform dan sort data berdasarkan tanggal (terbaru ke terlama)
  const transformedData = data
    .map((item, index) => {
      // Parse dan format ulang waktu untuk memastikan konsistensi
      let formattedTime = item.waktu;
      let parsedDate = new Date(item.waktu);
      
      try {
        if (!isNaN(parsedDate.getTime())) {
          formattedTime = parsedDate.toISOString(); // Format standar untuk chart
        } else {
          // Jika parsing gagal, coba beberapa format alternatif
          parsedDate = new Date();
        }
      } catch (error) {
        console.error("Error parsing date:", error, item.waktu);
        parsedDate = new Date();
      }
      
      return {
        ...item,
        waktu: formattedTime,
        parsedDate: parsedDate, // Simpan parsed date untuk sorting
        index: index + 1
      };
    })
    // ✅ Sort berdasarkan tanggal dari terbaru (descending)
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
    // Ambil 10 data terbaru saja
    .slice(0, 10)

  console.log("Original data:", data.slice(0, 3));
  console.log("Transformed and sorted data:", transformedData.slice(0, 3));

  // Ambil warna berdasarkan sensorId, fallback ke biru
  const strokeColor = colorMap[sensorId] || "#3b82f6";

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: any;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      try {
        const date = new Date(label || "");
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return (
            <div className="bg-white p-2 border rounded shadow text-sm text-gray-800">
              <p><strong>Value</strong> : {payload[0].value}</p>
            </div>
          );
        }
        
        const tanggal = date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
        const waktu = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        return (
          <div className="bg-white p-2 border rounded shadow text-sm text-gray-800">
            <p><strong>Date</strong> : {tanggal}</p>
            <p><strong>Time</strong> : {waktu}</p>
            <p><strong>Value</strong> : {payload[0].value}</p>
          </div>
        );
      } catch (error) {
        console.error("Error in tooltip:", error);
        return (
          <div className="bg-white p-2 border rounded shadow text-sm text-gray-800">
            <p><strong>Value</strong> : {payload[0].value}</p>
          </div>
        );
      }
    }

    return null;
  };

  // ✅ Jika tidak ada data atau data kosong
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-4 capitalize">{title}</h2>
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4 capitalize">{title}</h2>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="waktu" 
              tickFormatter={formatTimeOnly}
              interval="preserveStartEnd"
              fontSize={10}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              fontSize={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorGraph;