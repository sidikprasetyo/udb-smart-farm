import React from 'react';
import { Download, ChevronDown } from 'lucide-react';

interface HistoryItem {
  id: number;
  name: string;
  value: string;
  status: string;
  icon: string;
  timestamp: string;
}

interface Props {
  data: HistoryItem[];
}

const SensorHistory: React.FC<Props> = ({ data }) => {
  return (
    <div>
      {/* Filter dan Export */}
      <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
        <button className="flex items-center border border-gray-300 px-4 py-2 rounded-md bg-white shadow-sm hover:bg-gray-100 text-sm font-medium">
          Filter Option <ChevronDown className="ml-2 w-4 h-4" />
        </button>

        <button className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-semibold shadow">
          <Download className="w-4 h-4 mr-2" />
          Export
        </button>
      </div>

      {/* Grid Kartu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-md p-4 flex flex-col items-start space-y-2"
          >
            <div className="text-3xl">{item.icon}</div>
            <p className="font-semibold text-gray-800">{item.name}</p>

            {/* ✅ Nilai sensor */}
            <p className="text-black text-sm">Value: {item.value}</p>

            <div className="text-green-600 font-medium text-sm">{item.status}</div>
            <div className="text-sm text-gray-500">{item.timestamp}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SensorHistory;
