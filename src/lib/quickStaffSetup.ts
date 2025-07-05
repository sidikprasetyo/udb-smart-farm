// Quick utility untuk setup kepin@gmail.com staff data
import { doc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";

export const createKepinStaffQuick = async () => {
  try {
    console.log("🔄 Creating kepin@gmail.com staff record...");

    const staffData = {
      email: "kepin@gmail.com",
      username: "Bowo",
      roles: ["operator"],
      primaryRole: "operator",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Buat document dengan email sebagai ID
    await setDoc(doc(firestore, "staff", "kepin@gmail.com"), staffData);

    console.log("✅ Successfully created kepin@gmail.com staff record:", staffData);
    return { success: true, data: staffData };
  } catch (error) {
    console.error("❌ Error creating kepin@gmail.com staff:", error);
    return { success: false, error };
  }
};

// Function untuk langsung test dan buat jika perlu
export const ensureKepinStaffExists = async () => {
  try {
    // Import di dalam function untuk menghindari circular dependency
    const { getDoc, doc } = await import("firebase/firestore");

    console.log("🔍 Checking if kepin@gmail.com exists in staff collection...");

    const staffDoc = await getDoc(doc(firestore, "staff", "kepin@gmail.com"));

    if (staffDoc.exists()) {
      console.log("✅ kepin@gmail.com staff already exists:", staffDoc.data());
      return { success: true, existed: true, data: staffDoc.data() };
    } else {
      console.log("⚠️ kepin@gmail.com staff not found, creating...");
      const result = await createKepinStaffQuick();
      return { ...result, existed: false };
    }
  } catch (error) {
    console.error("❌ Error ensuring kepin@gmail.com staff exists:", error);
    return { success: false, error };
  }
};
