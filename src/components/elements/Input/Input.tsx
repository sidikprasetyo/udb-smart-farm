import React from "react";

interface InputProps {
  inputType: string;
  className?: string;
  name: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisable?: boolean;
  isRequired?: boolean;
}

const Input: React.FC<InputProps> = ({
  inputType,
  className = "peer h-12 w-full border bg-white text-slate-600 border-gray-300 rounded-md px-3 pt-4 pb-1 text-sm placeholder-transparent focus:outline-none focus:border-blue-500",
  name,
  placeholder,
  value,
  isDisable,
  isRequired,
  onChange,
}) => {
  return <input type={inputType} className={className} name={name} id={name} placeholder={placeholder} value={value} onChange={onChange} disabled={isDisable} required={isRequired} />;
};

export default Input;
