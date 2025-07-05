// Utility functions untuk manage user roles

import { setDoc, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";

export interface UserRoleData {
  uid: string;
  email: string;
  roles: string[];
  primaryRole: string;
  name?: string;
}

// Membuat user dengan multiple roles
export const createUserWithRoles = async (userData: UserRoleData) => {
  try {
    await setDoc(doc(firestore, "users", userData.uid), {
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

// Menambah role ke user yang sudah ada
export const addRoleToUser = async (uid: string, newRole: string) => {
  try {
    const userRef = doc(firestore, "users", uid);

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

// Menghapus role dari user
export const removeRoleFromUser = async (uid: string, roleToRemove: string) => {
  try {
    const userRef = doc(firestore, "users", uid);

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

// Mengubah primary role user
export const updatePrimaryRole = async (uid: string, newPrimaryRole: string) => {
  try {
    const userRef = doc(firestore, "users", uid);

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
    uid: "admin_user_1",
    email: "admin@smartfarm.com",
    roles: ["admin"],
    primaryRole: "admin",
    name: "System Administrator",
  },
  {
    uid: "petani_user_1",
    email: "petani@smartfarm.com",
    roles: ["petani"],
    primaryRole: "petani",
    name: "Farmer User",
  },
  {
    uid: "multi_role_user_1",
    email: "manager@smartfarm.com",
    roles: ["admin", "petani", "manager"],
    primaryRole: "manager",
    name: "Multi Role Manager",
  },
];
