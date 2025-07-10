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

interface SensorDataPoint {
  timestamp: string;
  value: number;
}

interface SensorGraphProps {
  title: string;
  data: SensorDataPoint[];
}

const SensorGraph: React.FC<SensorGraphProps> = ({ title, data }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-center mb-2 capitalize">{title}</h2>
      <p className="text-center text-gray-600 mb-4">Grafik Garis</p>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981" // Tailwind: emerald-500
              strokeWidth={2}
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
