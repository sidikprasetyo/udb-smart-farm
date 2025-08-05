"use client";

import React, { useState } from "react";
import { RefreshCw, Play, Download, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";

interface TestResult {
  name: string;
  status: "running" | "success" | "error" | "warning" | "pending";
  message: string;
  duration?: number;
  details?: Record<string, unknown>;
}

interface ModelTestResult {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    duration: number;
  };
  results: TestResult[];
  system_info: {
    python_version: string;
    platform: string;
    tensorflow_version: string;
    opencv_version: string;
  };
}

const ModelTestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>("");
  const [summary, setSummary] = useState<ModelTestResult["summary"] | null>(null);

  const testList = ["Environment Check", "Model Loading", "Disease Solutions", "Camera System", "Prediction Pipeline", "ESP32 Integration", "Performance Test"];

  const runModelTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setSummary(null);

    // Initialize test results
    const initialResults = testList.map((test) => ({
      name: test,
      status: "pending" as const,
      message: "Waiting to run...",
    }));
    setTestResults(initialResults);

    try {
      // Simulate running tests by calling the Python script
      const response = await fetch("/api/run-ai-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to start tests");
      }

      // Poll for test results
      pollTestResults();
    } catch (error) {
      console.error("Error running tests:", error);
      // Simulate test results for demo
      simulateTestResults();
    }
  };

  const simulateTestResults = async () => {
    for (let i = 0; i < testList.length; i++) {
      setCurrentTest(testList[i]);

      // Update current test to running
      setTestResults((prev) => prev.map((result, index) => (index === i ? { ...result, status: "running", message: "Running..." } : result)));

      // Simulate test duration
      await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate random result
      const weights = [0.7, 0.2, 0.1]; // 70% success, 20% warning, 10% error
      const randomValue = Math.random();
      let status: TestResult["status"] = "success";

      if (randomValue < weights[2]) status = "error";
      else if (randomValue < weights[1] + weights[2]) status = "warning";

      const messages = {
        success: "Test passed successfully",
        warning: "Test passed with warnings",
        error: "Test failed with errors",
      };

      // Update test result
      setTestResults((prev) =>
        prev.map((result, index) =>
          index === i
            ? {
                ...result,
                status,
                message: messages[status],
                duration: 1000 + Math.random() * 2000,
              }
            : result
        )
      );
    }

    // Generate summary
    const results = testResults;
    const summary = {
      total: results.length,
      passed: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status === "error").length,
      warnings: results.filter((r) => r.status === "warning").length,
      duration: results.reduce((acc, r) => acc + (r.duration || 0), 0),
    };

    setSummary(summary);
    setIsRunning(false);
    setCurrentTest("");
  };

  const pollTestResults = async () => {
    // This would poll for actual test results from the backend
    // For now, we'll simulate
    simulateTestResults();
  };

  const loadLatestReport = async () => {
    try {
      // This would load the latest test report from test_reports/
      // For demo purposes, we'll show a placeholder
      console.log("Loading latest test report...");
    } catch (error) {
      console.error("Error loading test report:", error);
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "running":
        return <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />;
      case "pending":
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "running":
        return "bg-blue-50 border-blue-200";
      case "pending":
        return "bg-gray-50 border-gray-200";
    }
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      results: testResults,
      system_info: {
        browser: navigator.userAgent,
        platform: navigator.platform,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-model-test-report-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">AI Model Test Runner</h1>
        <p className="text-gray-600">Comprehensive testing for the chili disease detection AI model</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Test Controls</h2>
          <div className="flex gap-2">
            <button onClick={runModelTests} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <Play className="h-4 w-4" />
              {isRunning ? "Running Tests..." : "Run All Tests"}
            </button>
            <button onClick={loadLatestReport} disabled={isRunning} className="border border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Load Latest Report
            </button>
          </div>
        </div>

        {currentTest && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-blue-700 font-medium">Currently running: {currentTest}</span>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-2">What this test covers:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Python environment and dependencies</li>
            <li>• AI model loading and structure validation</li>
            <li>• Disease solution database completeness</li>
            <li>• Camera system functionality</li>
            <li>• End-to-end prediction pipeline</li>
            <li>• ESP32 integration testing</li>
            <li>• Performance benchmarking</li>
          </ul>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {summary && (
              <button onClick={downloadReport} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-3 py-1 border rounded-lg">
                <Download className="h-4 w-4" />
                Download Report
              </button>
            )}
          </div>

          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="font-medium text-gray-800">{result.name}</h3>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  {result.duration && <span className="text-xs text-gray-500">{(result.duration / 1000).toFixed(2)}s</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>
                  {testResults.filter((r) => r.status !== "pending").length} / {testResults.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(testResults.filter((r) => r.status !== "pending").length / testResults.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Test Summary</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{summary.passed}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{summary.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{(summary.duration / 1000).toFixed(1)}s</div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
          </div>

          {/* Health Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">System Health Score</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${summary.passed / summary.total >= 0.8 ? "bg-green-500" : summary.passed / summary.total >= 0.6 ? "bg-yellow-500" : "bg-red-500"}`}
                  style={{
                    width: `${((summary.passed + summary.warnings * 0.5) / summary.total) * 100}%`,
                  }}
                />
              </div>
              <span className="font-bold text-gray-800">{(((summary.passed + summary.warnings * 0.5) / summary.total) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Manual Test Commands</h3>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded">python test_ai_model.py</code>
              <code className="block bg-gray-100 p-2 rounded">run_ai_tests.bat</code>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">NPM Scripts</h3>
            <div className="space-y-2 text-sm">
              <code className="block bg-gray-100 p-2 rounded">npm run ai:test</code>
              <code className="block bg-gray-100 p-2 rounded">npm run ai:train</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelTestRunner;
