import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/lib/firebaseAuth.ts", 
      "src/lib/staffTestUtils.ts",
      "src/components/FirebaseDebugPanel.tsx",
      "src/components/StaffManagement.tsx",
      "src/components/StaffManagementNew.tsx",
      "src/components/layouts/AuthLayout/index.tsx"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["src/app/api/predict/route.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: [
      "src/lib/staffMigration.ts",
      "src/contexts/AuthContext.tsx",
      "src/hooks/useAuth.ts",
      "src/components/StaffManagement.tsx"
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: [
      "src/components/MultiRoleProtectedRoute.tsx",
      "src/components/layouts/AuthLayout/index.tsx"
    ],
    rules: {
      "react/no-unescaped-entities": "off",
    },
  },
  {
    files: ["src/components/LiveCamera.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: [
      "src/app/dashboard/[id]/page.tsx",
      "src/app/dashboard/page.tsx",
      "src/components/StaffManagement.tsx",
      "src/hooks/useNotifications.ts"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
