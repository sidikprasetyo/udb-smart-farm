"use client";

import { useState } from "react";
import { collection, getDocs, getDoc, doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";
import { useAuth } from "@/contexts/AuthContext";

const FirebaseDebugPanel = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const { user } = useAuth();

  const checkStaffCollection = async () => {
    setLoading(true);
    setMessage("Checking staff collection...");
    setResults([]);

    try {
      const staffCollection = collection(firestore, "staff");
      const querySnapshot = await getDocs(staffCollection);

      const staffList: any[] = [];
      querySnapshot.forEach((doc) => {
        staffList.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setResults(staffList);
      setMessage(`Found ${staffList.length} staff records`);
      console.log("Staff collection data:", staffList);
    } catch (error) {
      setMessage(`Error: ${error}`);
      console.error("Error checking staff collection:", error);
    }

    setLoading(false);
  };

  const checkSpecificStaff = async (email: string) => {
    setLoading(true);
    setMessage(`Checking staff: ${email}`);

    try {
      const staffDoc = await getDoc(doc(firestore, "staff", email));

      if (staffDoc.exists()) {
        const data = staffDoc.data();
        setResults([{ id: email, ...data }]);
        setMessage(`✅ Found staff: ${email}`);
        console.log(`Staff ${email} data:`, data);
      } else {
        setResults([]);
        setMessage(`❌ Staff not found: ${email}`);
        console.log(`Staff ${email} not found`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
      console.error("Error checking specific staff:", error);
    }

    setLoading(false);
  };

  const createKepinStaff = async () => {
    setLoading(true);
    setMessage("Creating kepin@gmail.com staff...");

    try {
      const staffData = {
        email: "kepin@gmail.com",
        username: "Bowo",
        roles: ["operator"],
        primaryRole: "operator",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(firestore, "staff", "kepin@gmail.com"), staffData);

      setMessage("✅ Successfully created kepin@gmail.com staff record");
      console.log("Created staff:", staffData);

      // Check if it was created successfully
      await checkSpecificStaff("kepin@gmail.com");
    } catch (error) {
      setMessage(`Error creating staff: ${error}`);
      console.error("Error creating staff:", error);
    }

    setLoading(false);
  };

  const refreshAuth = () => {
    setMessage("Refreshing page to reload auth state...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed top-4 left-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-lg z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-gray-800">Firebase Debug</h3>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm">
          <strong>Current User:</strong> {user?.email || "Not logged in"}
        </div>

        {message && <div className={`text-sm p-2 rounded ${message.includes("✅") ? "bg-green-100 text-green-800" : message.includes("❌") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{message}</div>}
      </div>

      <div className="space-y-2 mb-4">
        <button onClick={checkStaffCollection} disabled={loading} className="w-full p-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
          Check All Staff
        </button>

        <button onClick={() => checkSpecificStaff("kepin@gmail.com")} disabled={loading} className="w-full p-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
          Check kepin@gmail.com
        </button>

        <button onClick={createKepinStaff} disabled={loading} className="w-full p-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50">
          Create kepin@gmail.com Staff
        </button>

        <button onClick={refreshAuth} disabled={loading} className="w-full p-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
          Refresh Auth State
        </button>

        <button
          onClick={() => {
            checkSpecificStaff("kepin@gmail.com").then(() => {
              setTimeout(refreshAuth, 1000);
            });
          }}
          disabled={loading}
          className="w-full p-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          🚀 Quick Fix kepin@gmail.com
        </button>
      </div>

      {results.length > 0 && (
        <div className="max-h-40 overflow-auto">
          <h4 className="font-medium text-sm mb-2">Results:</h4>
          {results.map((staff, index) => (
            <div key={index} className="text-xs bg-gray-100 p-2 rounded mb-1">
              <div>
                <strong>Email:</strong> {staff.id}
              </div>
              <div>
                <strong>Username:</strong> {staff.username}
              </div>
              <div>
                <strong>Roles:</strong> {JSON.stringify(staff.roles)}
              </div>
              <div>
                <strong>Primary:</strong> {staff.primaryRole}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FirebaseDebugPanel;
