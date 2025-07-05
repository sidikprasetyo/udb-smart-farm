"use client";

import LoginFragment from "@/components/fragments/LoginFragment";
import AuthLayout from "@/components/layouts/AuthLayout";
import { loginWithEmailAndPassword } from "@/lib/firebaseAuth";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

const LoginPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading if checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    return null;
  }

  const handleSubmit = async () => {
    // Validate input
    if (!loginData.email || !loginData.password) {
      toast.error("Please fill in all fields", {
        duration: 3000,
        position: "top-center",
      });
      return;
    }

    setLoginLoading(true);

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
      setLoginLoading(false);
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
    <AuthLayout title="login" onSubmit={handleSubmit} selfRegist={false} loading={loginLoading}>
      <LoginFragment loginData={loginData} onChange={handleChange} />
    </AuthLayout>
  );
};

export default LoginPage;
