"use client";

import LoginFragment from "@/components/fragments/LoginFragment";
import AuthLayout from "@/components/layouts/AuthLayout";
import React from "react";

const LoginPage = () => {
  return (
    <AuthLayout title="login" onSubmit={() => {}} selfRegist={false}>
      <LoginFragment />
    </AuthLayout>
  );
};

export default LoginPage;
