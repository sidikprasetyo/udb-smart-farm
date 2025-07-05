import React from "react";
import Notification, { NotificationData } from "../Notification";

interface NotificationContainerProps {
  notifications: NotificationData[];
  onRemoveNotification: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onRemoveNotification, position = "top-right" }) => {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "top-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-right":
      default:
        return "top-4 right-4";
    }
  };

  return (
    <div className={`fixed z-50 space-y-2 ${getPositionClasses()}`}>
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} onClose={onRemoveNotification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
