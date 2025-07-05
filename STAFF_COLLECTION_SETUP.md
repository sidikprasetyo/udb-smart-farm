# Multi-Role Authentication dengan Staff Collection

## Masalah

Sistem sebelumnya menggunakan collection "users" untuk menyimpan data role, tetapi data sebenarnya ada di collection "staff" dengan struktur berbeda.

## Solusi yang Diterapkan

### 1. Update AuthContext

- **File**: `src/contexts/AuthContext.tsx`
- **Perubahan**:
  - Sekarang mencari data di collection "staff" menggunakan email sebagai document ID
  - Fallback ke collection "users" jika tidak ditemukan di staff
  - Tambahan debug logging untuk troubleshooting
  - Tambahan field `debugInfo` untuk informasi debugging

### 2. Update UserRoleUtils

- **File**: `src/lib/userRoleUtils.ts`
- **Perubahan**:
  - Tambahan interface `StaffRoleData` untuk struktur staff collection
  - Function `createStaffWithRoles()` untuk membuat staff baru
  - Update existing functions untuk mendukung kedua collection (staff dan users)
  - Function `getUserByEmail()` untuk mendapatkan data staff berdasarkan email

### 3. Komponen Management Baru

#### AuthDebugPanel

- **File**: `src/components/AuthDebugPanel.tsx`
- **Fungsi**: Menampilkan informasi debug auth state untuk troubleshooting
- **Lokasi**: Muncul di pojok kanan bawah (hanya di development mode)

#### StaffManagement

- **File**: `src/components/StaffManagement.tsx`
- **Fungsi**:
  - Setup initial staff data
  - Verify staff collection
  - Test authentication untuk email tertentu
  - Create staff baru dengan multiple roles

### 4. Halaman Admin

- **File**: `src/app/admin/staff/page.tsx`
- **Fungsi**: Halaman admin untuk mengelola staff collection
- **Akses**: Hanya untuk role "admin" dan "operator"

### 5. Update Sidebar

- **File**: `src/components/Sidebar.tsx`
- **Perubahan**: Tambahan menu "Staff Management" yang hanya muncul untuk admin/operator

### 6. Utility Files

#### Staff Migration

- **File**: `src/lib/staffMigration.ts`
- **Fungsi**:
  - Migrasi data dari users ke staff collection
  - Setup initial staff data
  - Verifikasi staff collection
  - Test authentication

#### Staff Test Utils

- **File**: `src/lib/staffTestUtils.ts`
- **Fungsi**: Utility untuk testing dan debugging staff authentication

## Struktur Data Staff Collection

```javascript
// Document ID: email address (contoh: "kepin@gmail.com")
{
  email: "kepin@gmail.com",
  username: "Bowo",
  roles: ["operator"],        // Array of roles
  primaryRole: "operator",    // Primary/default role
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Cara Penggunaan

### 1. Setup Initial Data

1. Login sebagai admin/operator
2. Kunjungi `/admin/staff`
3. Klik "Setup Initial Data" untuk membuat data staff awal
4. Klik "Verify Collection" untuk memastikan data tersimpan

### 2. Test Authentication

1. Di halaman Staff Management, masukkan email di field "Email to test"
2. Klik "Test Auth" untuk memverifikasi authentication

### 3. Create New Staff

1. Isi form "Create New Staff"
2. Pilih roles yang diinginkan
3. Pilih primary role
4. Klik "Create Staff"

### 4. Debug Authentication Issues

1. AuthDebugPanel akan muncul di pojok kanan bawah (development mode)
2. Klik untuk melihat informasi auth state
3. Check console browser untuk log detail

## Data Sample yang Sudah Disiapkan

```javascript
[
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
];
```

## Troubleshooting

### Jika Staff Collection Tidak Terbaca:

1. Check console browser untuk error messages
2. Gunakan AuthDebugPanel untuk melihat auth state
3. Verifikasi data di Firebase Console collection "staff"
4. Pastikan email user match dengan document ID di collection staff

### Jika Role Tidak Terdeteksi:

1. Check field `roles` di document staff adalah array
2. Check field `primaryRole` di document staff adalah string
3. Pastikan primaryRole ada dalam array roles
4. Check console untuk error loading roles

### Jika Tidak Bisa Akses Halaman:

1. Check apakah user memiliki role yang diperlukan
2. Check MultiRoleProtectedRoute `allowedRoles`
3. Check `hasRole()` dan `hasAnyRole()` di AuthContext

## Next Steps

1. **Migration**: Jika ada data existing di collection "users", jalankan migration script
2. **Production**: Disable AuthDebugPanel di production
3. **Security**: Setup Firestore rules untuk collection "staff"
4. **Monitoring**: Setup logging untuk authentication failures
