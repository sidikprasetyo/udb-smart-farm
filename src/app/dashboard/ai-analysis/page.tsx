"use client";

import React from "react";
import Sidebar from "@/components/Sidebar-new";
import Header from "@/components/Header";
import MultiRoleProtectedRoute from "@/components/MultiRoleProtectedRoute";
import MobileMenu from "@/components/MobileMenu";

const AIAnalysisPage = () => {
  return (
    <MultiRoleProtectedRoute allowedRoles={["operator", "petani"]}>
      <div className="flex min-h-screen bg-gray-50">
        <MobileMenu currentPage="ai-analysis" />
        <div className="hidden lg:flex">
          <Sidebar currentPage="ai-analysis" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 lg:ml-20 transition-all duration-300">
          <Header title="AI Analysis" userName="User" />
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-sm p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-4">AI Analysis Dashboard</h2>
              <p className="text-gray-600 mb-6">Analyze your plant health using AI-powered disease detection.</p>

              {/* Placeholder content */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Disease Detection</h3>
                  <p className="text-blue-600 text-sm">Upload plant images for AI analysis</p>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Health Reports</h3>
                  <p className="text-green-600 text-sm">View detailed plant health reports</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Recommendations</h3>
                  <p className="text-purple-600 text-sm">Get AI-powered treatment suggestions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MultiRoleProtectedRoute>
  );
};

export default AIAnalysisPage;
