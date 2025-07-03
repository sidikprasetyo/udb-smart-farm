"use client";

import React from "react";
import Label from "./Label";
import Input from "./Input";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";

interface FormInputProps {
  name: string;
  inputType: string;
  placeholder?: string;
  isRequired?: boolean;
  children?: React.ReactNode;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput: React.FC<FormInputProps> = ({ name, inputType, placeholder, isRequired, children, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <div className="form-group relative w-full mx-auto">
        <Input name={name} inputType={showPassword ? "text" : inputType} placeholder={placeholder} isRequired={isRequired} value={value} onChange={onChange} />
        <Label htmlFor={name}>{children}</Label>

        <div className={`show-password absolute right-4 top-4 text-gray-500 text-sm cursor-pointer ${inputType === "password" ? "block" : "hidden"}`}>
          {!showPassword ? <FaEye className="w-5 h-5" onClick={() => setShowPassword(!showPassword)} /> : <FaEyeSlash className="w-5 h-5" onClick={() => setShowPassword(!showPassword)} />}
        </div>
      </div>
    </>
  );
};

export default FormInput;
