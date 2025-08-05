"use client";

import React from "react";
import Sidebar from "@/components/Sidebar-new";
import Header from "@/components/Header";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import MobileMenu from "@/components/MobileMenu";
import ModelTestRunner from "@/components/ModelTestRunner";

const AITestPage = () => {
  return (
    <MultiRoleProtectedRoute allowedRoles={["operator", "petani"]}>
      <div className="flex min-h-screen bg-gray-50">
        <MobileMenu currentPage="ai-test" />
        <div className="hidden lg:flex">
          <Sidebar currentPage="ai-test" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
          <Header title="AI Model Testing" userName="User" />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8 mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">AI Model Testing</h2>
              <p className="text-gray-600 mb-6">Test and validate the AI disease detection model performance.</p>

              {/* Model Test Runner Component */}
              <ModelTestRunner />
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AITestPage;
