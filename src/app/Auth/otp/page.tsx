"use client";

import OtpFragment from "@/components/fragments/OtpFragment";
import AuthLayout from "@/components/layouts/AuthLayout";
import React from "react";

const OtpPage = () => {
  return (
    <AuthLayout title="otp" onSubmit={() => {}} selfRegist={false}>
      <OtpFragment />
    </AuthLayout>
  );
};

export default OtpPage;
