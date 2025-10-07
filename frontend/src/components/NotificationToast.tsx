"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";

interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  timestamp: number;
}

export default function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { message, type } = event.detail;
      const notification: Notification = {
        id: Date.now().toString(),
        message,
        type,
        timestamp: Date.now()
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    };

    window.addEventListener("show-notification", handleNotification as EventListener);

    return () => {
      window.removeEventListener("show-notification", handleNotification as EventListener);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800";
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-[calc(100vw-2rem)] sm:max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border shadow-lg w-full animate-in slide-in-from-right-full duration-300 ${getBackgroundColor(notification.type)}`}
        >
          {getIcon(notification.type)}
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">
            {notification.message}
          </span>
          <button
            onClick={() => removeNotification(notification.id)}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}