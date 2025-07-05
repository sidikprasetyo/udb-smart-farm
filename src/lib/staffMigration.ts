// Migration script untuk setup staff collection dari existing data
// Jalankan ini jika perlu migrasi dari collection "users" ke "staff"

import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";
import { createStaffWithRoles, StaffRoleData } from "./userRoleUtils";

// Function untuk migrasi dari users ke staff collection
export const migrateUsersToStaff = async () => {
  try {
    console.log("🔄 Starting migration from users to staff collection...");

    const usersCollection = collection(firestore, "users");
    const querySnapshot = await getDocs(usersCollection);

    let migratedCount = 0;

    for (const docSnapshot of querySnapshot.docs) {
      const userData = docSnapshot.data();
      const userId = docSnapshot.id;

      if (userData.email) {
        const staffData: StaffRoleData = {
          email: userData.email,
          username: userData.name || userData.username || "Unknown",
          roles: userData.roles || ["user"],
          primaryRole: userData.primaryRole || "user",
        };

        // Create in staff collection using email as document ID
        const result = await createStaffWithRoles(staffData);

        if (result.success) {
          console.log(`✅ Migrated: ${userData.email}`);
          migratedCount++;
        } else {
          console.error(`❌ Failed to migrate: ${userData.email}`, result.error);
        }
      } else {
        console.warn(`⚠️ Skipped user ${userId}: no email found`);
      }
    }

    console.log(`🎉 Migration completed! Migrated ${migratedCount} users to staff collection.`);
    return { success: true, migratedCount };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return { success: false, error };
  }
};

// Function untuk setup staff collection dengan data sample
export const setupInitialStaffData = async () => {
  const initialStaff: StaffRoleData[] = [
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
      roles: ["admin", "petani", "operator", "user"],
      primaryRole: "operator",
    },
  ];

  console.log("🔄 Setting up initial staff data...");

  let createdCount = 0;

  for (const staffData of initialStaff) {
    try {
      const result = await createStaffWithRoles(staffData);

      if (result.success) {
        console.log(`✅ Created staff: ${staffData.email} with roles: ${staffData.roles.join(", ")}`);
        createdCount++;
      } else {
        console.error(`❌ Failed to create staff: ${staffData.email}`, result.error);
      }
    } catch (error) {
      console.error(`❌ Error creating staff: ${staffData.email}`, error);
    }
  }

  console.log(`🎉 Setup completed! Created ${createdCount} staff records.`);
  return { success: true, createdCount };
};

// Function untuk verifikasi staff collection
export const verifyStaffCollection = async () => {
  try {
    console.log("🔍 Verifying staff collection...");

    const staffCollection = collection(firestore, "staff");
    const querySnapshot = await getDocs(staffCollection);

    console.log(`📊 Found ${querySnapshot.size} staff records:`);

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ${doc.id}: ${data.username} (${data.primaryRole}) - Roles: ${data.roles?.join(", ") || "None"}`);
    });

    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error("❌ Error verifying staff collection:", error);
    return { success: false, error };
  }
};

// Function untuk test authentication dengan specific email
export const testStaffAuth = async (email: string) => {
  try {
    console.log(`🧪 Testing authentication for: ${email}`);

    const staffDoc = await getDocs(collection(firestore, "staff"));
    const staff = staffDoc.docs.find((doc) => doc.id === email);

    if (staff) {
      const data = staff.data();
      console.log("✅ Staff authentication test passed:", {
        email,
        username: data.username,
        roles: data.roles,
        primaryRole: data.primaryRole,
      });
      return { success: true, data };
    } else {
      console.error(`❌ Staff not found: ${email}`);
      return { success: false, error: "Staff not found" };
    }
  } catch (error) {
    console.error("❌ Authentication test failed:", error);
    return { success: false, error };
  }
};
