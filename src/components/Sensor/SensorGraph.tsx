import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// Warna tiap sensor
const colorMap: { [key: string]: string } = {
  suhu_udara: "#f97316",
  suhu_tanah: "#ef4444",
  kelembaban_udara: "#06b6d4",
  kelembaban_tanah: "#16a34a",
  curah_hujan: "#2563eb",
  kecepatan_angin: "#60a5fa",
  ph_tanah: "#9333ea",
  radiasi: "#facc15",
  nitrogen: "#3b82f6",
  phosphorus: "#8b5cf6",
  kalium: "#f59e0b",
  ec_tanah: "#22d3ee",
};

// Satuan tiap sensor
const unitMap: { [key: string]: string } = {
  suhu_udara: "°C",
  suhu_tanah: "°C",
  kelembaban_udara: "%RH",
  kelembaban_tanah: "%RH",
  curah_hujan: "mm",
  kecepatan_angin: "m/s",
  ph_tanah: "",
  radiasi: "W/m²",
  nitrogen: "mg/kg",
  phosphorus: "mg/kg",
  kalium: "mg/kg",
  ec_tanah: "μS/cm",
};

interface SensorGraphProps {
  title: string;
  data: {
    waktu: string;
    value: number;
  }[];
  sensorId: string;
}

// Type definition for tooltip payload
interface TooltipPayload {
  value: number;
  dataKey: string;
  color: string;
  payload: {
    waktu: string;
    value: number;
    parsedDate: Date;
    index: number;
  };
}

// Type definition for custom tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const SensorGraph: React.FC<SensorGraphProps> = ({ title, data, sensorId }) => {
  const unit = unitMap[sensorId] || "";

  const formatTimeOnly = (waktuString: string) => {
    try {
      const date = new Date(waktuString);
      return isNaN(date.getTime())
        ? "Invalid"
        : date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
    } catch {
      return "Error";
    }
  };

  const transformedData = data
    .map((item, index) => {
      let parsedDate = new Date(item.waktu);
      if (isNaN(parsedDate.getTime())) parsedDate = new Date();
      return {
        ...item,
        waktu: parsedDate.toISOString(),
        parsedDate,
        index: index + 1,
      };
    })
    .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime())
    .slice(0, 10);

  const strokeColor = colorMap[sensorId] || "#3b82f6";
  const average =
    transformedData.reduce((acc, cur) => acc + cur.value, 0) /
    (transformedData.length || 1);

  const formatValue = (val: number) =>
    `${val.toFixed(1)}${unit ? ` ${unit}` : ""}`;

  const CustomTooltip: React.FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      const date = new Date(label || "");
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow text-xs text-gray-800 space-y-1">
          <p><strong>Date:</strong> {tanggal}</p>
          <p><strong>Time:</strong> {waktu}</p>
          <p><strong>Value:</strong> {formatValue(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 capitalize">
          {title}
        </h2>
        <div className="w-full h-[300px] flex items-center justify-center">
          <p className="text-gray-400 text-sm">📉 No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 capitalize">
          {title}
        </h2>
        {unit && (
          <span className="text-sm text-gray-500 font-medium">
            Unit: {unit}
          </span>
        )}
      </div>

      <div className="w-full h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={transformedData}>
            <CartesianGrid strokeDasharray="4 2" stroke="#e5e7eb" />
            <XAxis
              dataKey="waktu"
              tickFormatter={formatTimeOnly}
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke="#9ca3af"
            />
            <YAxis
              fontSize={11}
              stroke="#9ca3af"
              tickFormatter={(val) => formatValue(val)}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={average}
              stroke="#8884d8"
              strokeDasharray="3 3"
              label={{
                value: `Avg: ${formatValue(average)}`,
                position: "right",
                fill: "#6b7280",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorGraph;