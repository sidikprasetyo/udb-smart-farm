"use client";

import LoginFragment from "@/components/fragments/LoginFragment";
import AuthLayout from "@/components/layouts/AuthLayout";
import { loginWithEmailAndPassword, getUserProfile } from "@/lib/firebaseAuth";
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 md:h-16 md:w-16 border-b-2 border-blue-600 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">Loading...</p>
        </div>
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

      if (result.success && result.user) {
        // Get user profile with roles from Firestore
        const profileResult = await getUserProfile(result.user.uid);

        if (profileResult.success) {
          const userData = profileResult.data;
          const primaryRole = userData?.primaryRole || "user";

          // Store user info with roles
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...result.user,
              roles: userData?.roles || ["user"],
              primaryRole: primaryRole,
            })
          );

          console.log("Login successful with roles:", userData?.roles);

          // Redirect based on primary role
          setTimeout(() => {
            switch (primaryRole) {
              case "admin":
                router.push("/admin/dashboard");
                break;
              case "petani":
                router.push("/petani/dashboard");
                break;
              case "manager":
                router.push("/manager/dashboard");
                break;
              default:
                router.push("/dashboard");
            }
          }, 1500);
        } else {
          // If no profile found, create default and redirect
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
        }
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
    <div className="min-h-screen bg-gray-50 px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
      <AuthLayout title="login" onSubmit={handleSubmit} selfRegist={false} loading={loginLoading}>
        <LoginFragment loginData={loginData} onChange={handleChange} />
      </AuthLayout>
    </div>
  );
};

export default LoginPage;
