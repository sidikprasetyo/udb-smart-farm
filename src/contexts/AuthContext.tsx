"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth } from "@/lib/firebaseAuth";
import { firestore } from "@/lib/firebaseAuth";

interface AuthContextType {
  user: User | null;
  userRoles: string[]; // Array roles
  primaryRole: string | null; // Role utama
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean; // Helper function
  hasAnyRole: (roles: string[]) => boolean; // Helper function
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  userRoles: [],
  primaryRole: null,
  hasRole: () => false,
  hasAnyRole: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Ambil data roles dari Firestore
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          const userData = userDoc.data();

          if (userData) {
            setUserRoles(userData.roles || []);
            setPrimaryRole(userData.primaryRole || null);
          } else {
            // Jika belum ada data di Firestore, set default
            setUserRoles(["user"]);
            setPrimaryRole("user");
          }
        } catch (error) {
          console.error("Error fetching user roles:", error);
          setUserRoles(["user"]);
          setPrimaryRole("user");
        }
      } else {
        setUserRoles([]);
        setPrimaryRole(null);
      }

      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper functions
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some((role) => userRoles.includes(role));
  };

  const value = {
    user,
    userRoles,
    primaryRole,
    loading,
    isAuthenticated: !!user,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
