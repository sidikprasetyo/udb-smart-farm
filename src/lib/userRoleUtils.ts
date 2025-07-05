// Utility functions untuk manage user roles

import { setDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";

export interface UserRoleData {
  email: string;
  username?: string;
  roles: string[];
  primaryRole: string;
  uid?: string; // Optional for staff collection
}

export interface StaffRoleData {
  email: string;
  username: string;
  roles: string[];
  primaryRole: string;
}

// Membuat staff dengan multiple roles (menggunakan email sebagai document ID)
export const createStaffWithRoles = async (staffData: StaffRoleData) => {
  try {
    await setDoc(doc(firestore, "staff", staffData.email), {
      ...staffData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating staff with roles:", error);
    return { success: false, error };
  }
};

// Membuat user dengan multiple roles (menggunakan UID sebagai document ID)
export const createUserWithRoles = async (userData: UserRoleData) => {
  try {
    const docId = userData.uid || userData.email;
    const collection = userData.uid ? "users" : "staff";

    await setDoc(doc(firestore, collection, docId), {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating user with roles:", error);
    return { success: false, error };
  }
};

// Menambah role ke user yang sudah ada (mendukung staff dan users collection)
export const addRoleToUser = async (identifier: string, newRole: string, useEmail: boolean = false) => {
  try {
    const collection = useEmail ? "staff" : "users";
    const userRef = doc(firestore, collection, identifier);

    await updateDoc(userRef, {
      roles: arrayUnion(newRole),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding role to user:", error);
    return { success: false, error };
  }
};

// Menghapus role dari user (mendukung staff dan users collection)
export const removeRoleFromUser = async (identifier: string, roleToRemove: string, useEmail: boolean = false) => {
  try {
    const collection = useEmail ? "staff" : "users";
    const userRef = doc(firestore, collection, identifier);

    await updateDoc(userRef, {
      roles: arrayRemove(roleToRemove),
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing role from user:", error);
    return { success: false, error };
  }
};

// Mengubah primary role user (mendukung staff dan users collection)
export const updatePrimaryRole = async (identifier: string, newPrimaryRole: string, useEmail: boolean = false) => {
  try {
    const collection = useEmail ? "staff" : "users";
    const userRef = doc(firestore, collection, identifier);

    await updateDoc(userRef, {
      primaryRole: newPrimaryRole,
      updatedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating primary role:", error);
    return { success: false, error };
  }
};

// Contoh data untuk testing
export const sampleUsers = [
  {
    email: "admin@smartfarm.com",
    roles: ["admin"],
    primaryRole: "admin",
    username: "System Administrator",
  },
  {
    email: "petani@smartfarm.com",
    roles: ["petani"],
    primaryRole: "petani",
    username: "Farmer User",
  },
  {
    email: "manager@smartfarm.com",
    roles: ["admin", "petani", "operator"],
    primaryRole: "operator",
    username: "Multi Role Manager",
  },
  {
    email: "kepin@gmail.com",
    roles: ["operator"],
    primaryRole: "operator",
    username: "Bowo",
  },
];

// Helper function untuk mendapatkan data user berdasarkan email dari staff collection
export const getUserByEmail = async (email: string) => {
  try {
    const staffDoc = await getDoc(doc(firestore, "staff", email));

    if (staffDoc.exists()) {
      return { success: true, data: staffDoc.data() };
    } else {
      return { success: false, error: "User not found in staff collection" };
    }
  } catch (error) {
    console.error("Error getting user by email:", error);
    return { success: false, error };
  }
};
