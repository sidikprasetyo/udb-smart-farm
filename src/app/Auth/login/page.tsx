"use client";

import LoginFragment from "@/components/fragments/LoginFragment";
import AuthLayout from "@/components/layouts/AuthLayout";
import { loginWithEmailAndPassword } from "@/lib/firebaseAuth";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async () => {
    // Validate input
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Attempting login with:", loginData);

      const result = await loginWithEmailAndPassword(loginData.email, loginData.password);

      if (result.success) {
        // Store user token/info if needed
        localStorage.setItem("user", JSON.stringify(result.user));
        console.log("Login successful:", result);

        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
      // Error handling is now done in firebaseAuth.ts with toast notifications
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "#fff",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <AuthLayout title="login" onSubmit={handleSubmit} selfRegist={false} loading={loading}>
      <LoginFragment loginData={loginData} onChange={handleChange} />
    </AuthLayout>
  );
};

export default LoginPage;
