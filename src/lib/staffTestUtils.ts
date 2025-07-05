// Utility untuk testing staff collection dan multi-role authentication

import { createStaffWithRoles, getUserByEmail, StaffRoleData } from "./userRoleUtils";

// Test data berdasarkan struktur yang Anda berikan
export const testStaffData: StaffRoleData[] = [
  {
    email: "kepin@gmail.com",
    username: "Bowo",
    roles: ["operator"],
    primaryRole: "operator",
  },
  // Tambahan data untuk testing multi-role
  {
    email: "admin@smartfarm.com",
    username: "Administrator",
    roles: ["admin", "operator"],
    primaryRole: "admin",
  },
  {
    email: "petani@smartfarm.com",
    username: "Farmer Test",
    roles: ["petani", "user"],
    primaryRole: "petani",
  },
];

// Function untuk setup initial staff data
export const setupTestStaffData = async () => {
  console.log("Setting up test staff data...");

  for (const staffData of testStaffData) {
    try {
      const result = await createStaffWithRoles(staffData);
      if (result.success) {
        console.log(`✅ Staff created: ${staffData.email} with roles: ${staffData.roles.join(", ")}`);
      } else {
        console.error(`❌ Failed to create staff: ${staffData.email}`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creating staff: ${staffData.email}`, error);
    }
  }

  console.log("Staff data setup complete!");
};

// Function untuk test authentication dengan staff collection
export const testStaffAuthentication = async (email: string) => {
  console.log(`Testing authentication for: ${email}`);

  try {
    const result = await getUserByEmail(email);

    if (result.success && result.data) {
      const userData = result.data;
      console.log("✅ Staff found:", {
        email: email,
        username: userData.username,
        roles: userData.roles,
        primaryRole: userData.primaryRole,
      });
      return userData;
    } else {
      console.error("❌ Staff not found:", result.error);
      return null;
    }
  } catch (error) {
    console.error("❌ Error testing authentication:", error);
    return null;
  }
};

// Function untuk validate staff role structure
export const validateStaffStructure = (staffData: any): boolean => {
  const requiredFields = ["email", "username", "roles", "primaryRole"];

  for (const field of requiredFields) {
    if (!(field in staffData)) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }

  if (!Array.isArray(staffData.roles)) {
    console.error("❌ roles field must be an array");
    return false;
  }

  if (typeof staffData.primaryRole !== "string") {
    console.error("❌ primaryRole field must be a string");
    return false;
  }

  if (!staffData.roles.includes(staffData.primaryRole)) {
    console.error("❌ primaryRole must be included in roles array");
    return false;
  }

  console.log("✅ Staff structure is valid");
  return true;
};

// Debug function untuk logging current auth state
export const debugAuthState = (authData: { user: any; userRoles: string[]; primaryRole: string | null; isAuthenticated: boolean }) => {
  console.log("🔍 Current Auth State:", {
    userEmail: authData.user?.email || "Not logged in",
    userRoles: authData.userRoles,
    primaryRole: authData.primaryRole,
    isAuthenticated: authData.isAuthenticated,
    rolesCount: authData.userRoles.length,
  });
};
