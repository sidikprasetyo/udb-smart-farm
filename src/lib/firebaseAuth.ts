import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import toast from "react-hot-toast";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app);

// Authentication functions
export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    // Show loading toast
    const loadingToast = toast.loading("Logging in...");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success("Login successful! Welcome back! 🎉", {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#10B981",
        color: "#fff",
      },
    });

    return {
      success: true,
      user: userCredential.user,
      message: "Login successful",
    };
  } catch (error: any) {
    const errorMessage = getErrorMessage(error.code);

    // Show error toast
    toast.error(errorMessage, {
      duration: 5000,
      position: "top-center",
      style: {
        background: "#EF4444",
        color: "#fff",
      },
    });

    return {
      success: false,
      error: error.code,
      message: errorMessage,
    };
  }
};

export const registerWithEmailAndPassword = async (email: string, password: string) => {
  try {
    // Show loading toast
    const loadingToast = toast.loading("Creating your account...");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success("Account created successfully! Welcome! 🎉", {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#10B981",
        color: "#fff",
      },
    });

    return {
      success: true,
      user: userCredential.user,
      message: "Registration successful",
    };
  } catch (error: any) {
    const errorMessage = getErrorMessage(error.code);

    // Show error toast
    toast.error(errorMessage, {
      duration: 5000,
      position: "top-center",
      style: {
        background: "#EF4444",
        color: "#fff",
      },
    });

    return {
      success: false,
      error: error.code,
      message: errorMessage,
    };
  }
};

export const logout = async () => {
  try {
    // Show loading toast
    const loadingToast = toast.loading("Logging out...");

    await signOut(auth);

    // Dismiss loading toast and show success
    toast.dismiss(loadingToast);
    toast.success("Logged out successfully! See you soon! 👋", {
      duration: 3000,
      position: "top-center",
      style: {
        background: "#6366F1",
        color: "#fff",
      },
    });

    return {
      success: true,
      message: "Logout successful",
    };
  } catch (error: any) {
    // Show error toast
    toast.error("Failed to logout. Please try again.", {
      duration: 4000,
      position: "top-center",
      style: {
        background: "#EF4444",
        color: "#fff",
      },
    });

    return {
      success: false,
      error: error.code,
      message: "Logout failed",
    };
  }
};

// Helper function to get user-friendly error messages
const getErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case "auth/user-not-found":
      return "User not found. Please check your email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-email":
      return "Invalid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/email-already-in-use":
      return "Email address is already in use.";
    case "auth/weak-password":
      return "Password is too weak. Please use a stronger password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "An error occurred. Please try again.";
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};
