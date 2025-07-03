
"use client";
import { useEffect, useRef, useState } from "react";

interface OtpInputProps {
  length?: number;
  onChange?: (otp: string) => void;
}

const OtpInput = ({ length = 6, onChange = () => {} }: OtpInputProps) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Call onChange with complete OTP
    onChange(newOtp.join(""));

    // Move to next input if available
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Perbaiki tipe event pada handleKeyDown (harus KeyboardEvent)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Tambahan: jika user tekan panah kiri/kanan
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div className="opt-input-wrapper w-full flex items-center mt-5 gap-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(ref) => {
            inputRefs.current[index] = ref;
          }}
          className="w-10 h-10 border-2 border-gray-400 rounded-md text-center focus:border-green-500 focus:outline-none"
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={otp[index]}
          autoFocus={index === 0}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
