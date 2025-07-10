import { useState, useCallback } from "react";
import { NotificationData } from "@/components/elements/Notification";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = useCallback((type: NotificationData["type"], title: string, message: string, duration: number = 5000) => {
    // Generate truly unique ID using timestamp + random string
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: NotificationData = {
      id,
      type,
      title,
      message,
      duration,
    };

    setNotifications((prev) => [...prev, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  };
};

export default useNotifications;