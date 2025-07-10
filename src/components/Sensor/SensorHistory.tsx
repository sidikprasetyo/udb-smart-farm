import React from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { JSX } from 'react';

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
        {data.map((item) => {
          const progressValue = !isNaN(parseFloat(item.value))
            ? parseFloat(item.value)
            : 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow p-4 flex items-center gap-4"
            >
              {/* Ikon */}
              <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-gray-100 rounded-xl text-4xl">
                {item.icon}
              </div>

              {/* Info */}
              <div className="flex-1 space-y-1">
                <p className="text-sm font-semibold text-gray-800">
                  {item.name}
                </p>

                {/* Nilai & Progress Bar */}
                <div className="text-base font-bold text-black">
                  {item.value}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color}`}
                    style={{
                      width: `${progressValue}%`,
                    }}
                  />
                </div>

                {/* Status & Timestamp */}
                <div className="text-sm text-gray-500 flex flex-col">
                  <span className="text-green-600 font-medium">
                    {item.status}
                  </span>
                  <span>At {item.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SensorHistory;
