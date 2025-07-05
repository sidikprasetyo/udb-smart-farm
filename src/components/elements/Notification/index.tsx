import React from "react";
import { FaCheck, FaTimes, FaExclamationTriangle, FaInfo } from "react-icons/fa";

export interface NotificationData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationProps extends NotificationData {
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ id, type, title, message, onClose }) => {
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <FaCheck className="w-4 h-4" />,
          borderColor: "border-green-500",
          iconBg: "bg-green-100 text-green-600",
        };
      case "error":
        return {
          icon: <FaTimes className="w-4 h-4" />,
          borderColor: "border-red-500",
          iconBg: "bg-red-100 text-red-600",
        };
      case "warning":
        return {
          icon: <FaExclamationTriangle className="w-4 h-4" />,
          borderColor: "border-yellow-500",
          iconBg: "bg-yellow-100 text-yellow-600",
        };
      case "info":
        return {
          icon: <FaInfo className="w-4 h-4" />,
          borderColor: "border-blue-500",
          iconBg: "bg-blue-100 text-blue-600",
        };
      default:
        return {
          icon: <FaInfo className="w-4 h-4" />,
          borderColor: "border-gray-500",
          iconBg: "bg-gray-100 text-gray-600",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className={`p-4 rounded-lg shadow-lg border-l-4 bg-white min-w-80 transform transition-all duration-300 translate-x-0 opacity-100 ${config.borderColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className={`p-1 rounded-full ${config.iconBg}`}>{config.icon}</div>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        <button onClick={() => onClose(id)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
