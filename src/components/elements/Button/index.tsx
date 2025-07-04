import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = "bg-[#22C55E] text-white w-full h-10 px-4 py-3 cursor-pointer", disabled = false, type = "button" }) => {
  return (
    <button className={`${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`} onClick={onClick} type={type} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
