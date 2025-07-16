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
  suhu: "#ef4444",                // bg-red-500
  dht_temperature: "#f97316",     // bg-orange-500
  dht_humidity: "#06b6d4",        // bg-cyan-500
  kelembaban: "#4ade80",          // bg-green-400
  radiasi: "#facc15",             // bg-yellow-500
  natrium: "#3b82f6",             // bg-blue-500
  fosfor: "#8b5cf6",              // bg-purple-500
  kalium: "#f59e0b",              // bg-yellow-600
};

interface SensorGraphProps {
  title: string;
  data: {
    timestamp: string;
    value: number;
  }[];
  sensorId: string;
}

const SensorGraph: React.FC<SensorGraphProps> = ({ title, data, sensorId }) => {
  // Format waktu menjadi HH:mm
  const formatTimeOnly = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

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
      const date = new Date(label || "");
      const tanggal = date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const waktu = date.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div className="bg-white p-2 border rounded shadow text-sm text-gray-800">
          <p><strong>Tanggal</strong> : {tanggal}</p>
          <p><strong>Waktu</strong> : {waktu}</p>
          <p><strong>Value</strong> : {payload[0].value}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4 capitalize">{title}</h2>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatTimeOnly}
              interval="preserveStartEnd"
              fontSize={10}
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
