// Initial Staff Setup Utility - untuk keperluan development dan testing

import { createStaffWithRoles, StaffRoleData } from "./userRoleUtils";

export const initialStaffData: StaffRoleData[] = [
  {
    email: "kepin@gmail.com",
    username: "Bowo",
    roles: ["operator"],
    primaryRole: "operator",
  },
  {
    email: "admin@smartfarm.com",
    username: "Administrator",
    roles: ["admin", "operator"],
    primaryRole: "admin",
  },
  {
    email: "petani@smartfarm.com",
    username: "Farmer",
    roles: ["petani", "user"],
    primaryRole: "petani",
  },
  {
    email: "manager@smartfarm.com",
    username: "Manager",
    roles: ["admin", "petani", "operator", "manager"],
    primaryRole: "manager",
  },
];

export const setupInitialStaff = async () => {
  console.log("Setting up initial staff data...");

  let createdCount = 0;
  const results = [];

  for (const staff of initialStaffData) {
    try {
      const result = await createStaffWithRoles(staff);
      if (result.success) {
        console.log(`✅ Created: ${staff.email}`);
        createdCount++;
        results.push({ email: staff.email, status: "created" });
      } else {
        console.log(`⚠️ Skipped: ${staff.email} (may already exist)`);
        results.push({ email: staff.email, status: "skipped", error: result.error });
      }
    } catch (error) {
      console.error(`❌ Error creating ${staff.email}:`, error);
      results.push({ email: staff.email, status: "error", error });
    }
  }

  console.log(`Setup completed! Created ${createdCount} new staff records.`);
  return { success: true, createdCount, results };
};
