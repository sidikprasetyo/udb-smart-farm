"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const AuthDebugPanel = () => {
  const { user, userRoles, primaryRole, debugInfo, isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button onClick={() => setIsVisible(true)} className="fixed bottom-4 right-4 bg-blue-600 text-white px-3 py-2 rounded text-xs hover:bg-blue-700 z-50">
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Auth Debug Info</h3>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <strong>Email:</strong> {user?.email || "Not logged in"}
        </div>

        <div>
          <strong>Authenticated:</strong> {isAuthenticated ? "✅ Yes" : "❌ No"}
        </div>

        <div>
          <strong>Primary Role:</strong> {primaryRole || "None"}
        </div>

        <div>
          <strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(", ") : "None"}
        </div>

        {debugInfo && (
          <>
            <div>
              <strong>Data Source:</strong> {debugInfo.dataSource || "Unknown"}
            </div>

            <div>
              <strong>Last Updated:</strong> {debugInfo.timestamp ? new Date(debugInfo.timestamp).toLocaleTimeString() : "Unknown"}
            </div>

            {debugInfo.error && (
              <div className="text-red-600">
                <strong>Error:</strong> {typeof debugInfo.error === "string" ? debugInfo.error : JSON.stringify(debugInfo.error)}
              </div>
            )}

            <details className="mt-2">
              <summary className="cursor-pointer font-medium">Raw Debug Data</summary>
              <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPanel;
