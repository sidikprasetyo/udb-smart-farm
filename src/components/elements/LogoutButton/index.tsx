"use client";

import React from "react";
import { IoLogOut } from "react-icons/io5";
import Button from "@/components/elements/Button";
import useLogout from "@/hooks/useLogout";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "icon-only" | "text-only";
  size?: "sm" | "md" | "lg";
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className, variant = "default", size = "md" }) => {
  const { handleLogout } = useLogout();

  const getButtonClass = () => {
    const baseClass = "bg-red-500 hover:bg-red-600 text-white transition-colors duration-200";
    const sizeClasses = {
      sm: "h-8 px-3 py-1 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 py-3 text-lg",
    };

    return `${baseClass} ${sizeClasses[size]} ${className || ""}`;
  };

  const renderContent = () => {
    switch (variant) {
      case "icon-only":
        return <IoLogOut className="text-xl" />;
      case "text-only":
        return <span className="font-semibold">Logout</span>;
      default:
        return (
          <div className="flex items-center justify-center gap-2">
            <IoLogOut className="text-xl" />
            <span className="font-semibold">Logout</span>
          </div>
        );
    }
  };

  return (
    <Button onClick={handleLogout} className={getButtonClass()} type="button">
      {renderContent()}
    </Button>
  );
};

export default LogoutButton;
