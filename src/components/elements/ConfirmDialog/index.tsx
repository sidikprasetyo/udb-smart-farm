import React from "react";
import { FaTrash, FaPlus, FaEdit, FaExclamationTriangle, FaUser, FaEnvelope } from "react-icons/fa";
import Modal from "../Modal";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "create" | "update" | "delete" | "warning";
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  staffInfo?: {
    username: string;
    email: string;
  };
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, type, title, message, confirmText, cancelText = "Cancel", isLoading = false, staffInfo }) => {
  const getTypeConfig = () => {
    switch (type) {
      case "delete":
        return {
          icon: <FaTrash className="w-5 h-5" />,
          iconBg: "bg-red-100 text-red-600",
          confirmBg: "bg-red-600 hover:bg-red-700",
          defaultConfirmText: "Delete",
        };
      case "create":
        return {
          icon: <FaPlus className="w-5 h-5" />,
          iconBg: "bg-green-100 text-green-600",
          confirmBg: "bg-green-600 hover:bg-green-700",
          defaultConfirmText: "Create",
        };
      case "update":
        return {
          icon: <FaEdit className="w-5 h-5" />,
          iconBg: "bg-blue-100 text-blue-600",
          confirmBg: "bg-blue-600 hover:bg-blue-700",
          defaultConfirmText: "Update",
        };
      case "warning":
        return {
          icon: <FaExclamationTriangle className="w-5 h-5" />,
          iconBg: "bg-yellow-100 text-yellow-600",
          confirmBg: "bg-yellow-600 hover:bg-yellow-700",
          defaultConfirmText: "Confirm",
        };
      default:
        return {
          icon: <FaExclamationTriangle className="w-5 h-5" />,
          iconBg: "bg-gray-100 text-gray-600",
          confirmBg: "bg-gray-600 hover:bg-gray-700",
          defaultConfirmText: "Confirm",
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false}>
      <div className="text-center">
        {/* Icon */}
        <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full ${config.iconBg} mb-4`}>{config.icon}</div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>

        {/* Message */}
        <p className="text-gray-600 mb-6">{message}</p>

        {/* Staff Info */}
        {staffInfo && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
            <div className="flex items-center gap-2 mb-2">
              <FaUser className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{staffInfo.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{staffInfo.email}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} disabled={isLoading} className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${config.confirmBg}`}>
            {isLoading ? "Processing..." : confirmText || config.defaultConfirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
