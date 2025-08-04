import React, { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
  onRemove: (id: string) => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ id, type, message, onRemove, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
  };

  const colors = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-500 text-white",
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg shadow-lg ${colors[type]} animate-slide-in`}>
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={() => onRemove(id)} className="hover:bg-black hover:bg-opacity-10 p-1 rounded">
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: "success" | "error" | "warning";
    message: string;
  }>;
  onRemoveToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} id={toast.id} type={toast.type} message={toast.message} onRemove={onRemoveToast} />
      ))}
    </div>
  );
};
