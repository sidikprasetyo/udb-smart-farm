import { useRouter } from "next/navigation";
import { logout } from "@/lib/firebaseAuth";

export const useLogout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logout();

      if (result.success) {
        // Clear localStorage
        localStorage.removeItem("user");

        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      }
      // Error handling is done in firebaseAuth.ts with toast notifications
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { handleLogout };
};

export default useLogout;
