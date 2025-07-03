import OtpInput from "@/components/elements/OTPInput";
import React from "react";

const OtpFragment = () => {
  return (
    <>
      <div>
        <h2 className="text-slate-600">Enter Verification Code</h2>
        <OtpInput length={6} />
        <p className="text-sm text-gray-500 mt-2">Please enter the verification code sent to your email.</p>
      </div>
    </>
  );
};

export default OtpFragment;
