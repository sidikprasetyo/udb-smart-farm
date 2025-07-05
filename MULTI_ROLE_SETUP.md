# Multi-Role Authentication System

Sistem autentikasi multi-role telah berhasil diimplementasikan dengan Firebase + Firestore.

## 🚀 Fitur yang Telah Diimplementasikan

### 1. **AuthContext dengan Multi-Role Support**

- ✅ Support multiple roles per user
- ✅ Helper functions: `hasRole()`, `hasAnyRole()`
- ✅ Primary role management
- ✅ Automatic Firestore integration

### 2. **MultiRoleProtectedRoute Component**

- ✅ Proteksi berdasarkan array roles
- ✅ Support `requireAll` mode (butuh semua role vs salah satu)
- ✅ Access denied page dengan informasi role

### 3. **Role-based Redirects**

- ✅ Login redirect berdasarkan primary role
- ✅ Admin → `/admin/dashboard`
- ✅ Petani → `/petani/dashboard`
- ✅ Default → `/dashboard`

### 4. **Role Switcher Component**

- ✅ Switch between available roles
- ✅ Auto redirect ke dashboard yang sesuai
- ✅ Tersimpan di localStorage

### 5. **Firestore Integration**

- ✅ Automatic user profile creation
- ✅ Role management utilities
- ✅ Add/remove roles functions

## 📁 Struktur File yang Dibuat/Diupdate

```
src/
├── contexts/
│   └── AuthContext.tsx ✅ (Updated dengan multi-role)
├── components/
│   ├── MultiRoleProtectedRoute.tsx ✅ (New)
│   └── RoleSwitcher.tsx ✅ (New)
├── app/
│   ├── auth/login/page.tsx ✅ (Updated dengan role redirect)
│   ├── dashboard/page.tsx ✅ (Updated dengan MultiRoleProtectedRoute)
│   ├── admin/dashboard/page.tsx ✅ (New - Admin only)
│   └── petani/dashboard/page.tsx ✅ (New - Petani + Admin)
├── lib/
│   ├── firebaseAuth.ts ✅ (Updated dengan profile functions)
│   └── userRoleUtils.ts ✅ (New - Role management utilities)
```

## 🔧 Cara Menggunakan

### 1. **Proteksi Halaman dengan Single Role**

```tsx
<MultiRoleProtectedRoute allowedRoles={["admin"]}>
  <AdminPage />
</MultiRoleProtectedRoute>
```

### 2. **Proteksi Halaman dengan Multiple Roles (OR)**

```tsx
<MultiRoleProtectedRoute allowedRoles={["admin", "manager"]}>
  <ManagementPage />
</MultiRoleProtectedRoute>
```

### 3. **Proteksi Halaman dengan Multiple Roles (AND)**

```tsx
<MultiRoleProtectedRoute allowedRoles={["admin", "manager"]} requireAll={true}>
  <SuperAdminPage />
</MultiRoleProtectedRoute>
```

### 4. **Menggunakan Role dalam Component**

```tsx
const { hasRole, hasAnyRole, userRoles, primaryRole } = useAuth();

// Cek single role
if (hasRole("admin")) {
  // Show admin content
}

// Cek multiple roles
if (hasAnyRole(["admin", "manager"])) {
  // Show management content
}
```

## 📊 Struktur Data User di Firestore

```js
// Collection: users
// Document ID: userUID
{
  uid: "user_uid_from_auth",
  email: "user@email.com",
  roles: ["admin", "petani"], // Array of roles
  primaryRole: "admin", // Main role for redirect
  name: "User Name",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🛡️ Keamanan

- ✅ Client-side role checking (UI/UX)
- ⚠️ **PENTING**: Tambahkan server-side validation di API routes
- ✅ Firebase rules untuk proteksi Firestore
- ✅ Automatic profile creation saat registrasi

## 🧪 Testing

Untuk testing, gunakan sample users di `userRoleUtils.ts`:

```js
// User dengan single role
{
  email: "admin@smartfarm.com",
  roles: ["admin"],
  primaryRole: "admin"
}

// User dengan multiple roles
{
  email: "manager@smartfarm.com",
  roles: ["admin", "petani", "manager"],
  primaryRole: "manager"
}
```

## 🚀 Next Steps

1. **Buat halaman admin untuk user management**
2. **Implementasi Firebase Security Rules**
3. **Tambah API routes dengan server-side validation**
4. **Buat role hierarchy system**
5. **Implementasi audit log untuk role changes**

---

**Status**: ✅ Ready to use! Sistem multi-role sudah siap digunakan.
