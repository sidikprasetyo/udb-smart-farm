import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({ onClick, children, className = "bg-[#22C55E] text-white w-full h-10 px-4 py-3" }) => {
  return (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  );
};

export default Button;
