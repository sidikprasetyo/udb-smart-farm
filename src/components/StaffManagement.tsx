"use client";

import { useState, useEffect, useRef } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firestore, auth } from "@/lib/firebaseAuth";
import { createStaffWithRoles, StaffRoleData } from "@/lib/userRoleUtils";
import { setupInitialStaff } from "@/lib/initialStaffSetup";
import { FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope, FaDatabase, FaEye, FaEyeSlash } from "react-icons/fa";
import ConfirmDialog from "@/components/elements/ConfirmDialog";
import NotificationContainer from "@/components/elements/NotificationContainer";
import { useNotifications } from "@/hooks/useNotifications";

interface Staff extends StaffRoleData {
  id: string;
  createdAt?: any;
  updatedAt?: any;
}

interface StaffFormData extends StaffRoleData {
  password?: string;
  confirmPassword?: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  type: "create" | "update" | "delete" | "warning";
  title: string;
  message: string;
  staff?: Staff | null;
  onConfirm: () => void;
}

const StaffManagement = () => {
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: "create",
    title: "",
    message: "",
    staff: null,
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState<StaffFormData>({
    email: "",
    username: "",
    roles: ["user"],
    primaryRole: "user",
    password: "",
    confirmPassword: "",
  });

  const hasInitialized = useRef(false);

  // Use the notifications hook
  const { notifications, addNotification, removeNotification } = useNotifications();

  const availableRoles = ["admin", "operator", "petani", "manager", "user"];

  // Modal functions
  const openConfirmModal = (type: ConfirmModalState["type"], title: string, message: string, onConfirm: () => void, staff?: Staff) => {
    setConfirmModal({
      isOpen: true,
      type,
      title,
      message,
      staff,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Load staff data
  const loadStaffData = async () => {
    setLoading(true);
    try {
      const staffCollection = collection(firestore, "staff");
      const querySnapshot = await getDocs(staffCollection);

      const staffData: Staff[] = [];
      querySnapshot.forEach((doc) => {
        staffData.push({
          id: doc.id,
          ...doc.data(),
        } as Staff);
      });

      setStaffList(staffData);

      // Only show notification if we actually have data AND this is not initial load
      if (staffData.length > 0 && hasInitialized.current) {
        addNotification("info", "Data Loaded", `Loaded ${staffData.length} staff records`);
      }
    } catch (error) {
      addNotification("error", "Load Error", `Error loading staff: ${error}`);
      console.error("Error loading staff:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      loadStaffData();
    }
  }, []);

  // Setup initial staff data
  const handleSetupInitialData = async () => {
    setLoading(true);
    try {
      const result = await setupInitialStaff();
      addNotification("success", "Setup Complete", `Created ${result.createdCount} staff records successfully`);
      await loadStaffData(); // Reload data
    } catch (error) {
      addNotification("error", "Setup Failed", `Error setting up initial data: ${error}`);
    }
    setLoading(false);
  };

  // Create new staff
  const handleCreateStaff = async () => {
    if (!formData.email || !formData.username || !formData.password) {
      addNotification("warning", "Missing Fields", "Please fill in email, username, and password");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      addNotification("error", "Password Mismatch", "Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      addNotification("error", "Weak Password", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);

      // 2. Create staff record in Firestore
      const staffData: StaffRoleData = {
        email: formData.email,
        username: formData.username,
        roles: formData.roles,
        primaryRole: formData.primaryRole,
      };

      const result = await createStaffWithRoles(staffData);

      if (result.success) {
        addNotification("success", "Staff Created", `Staff and user account created successfully: ${formData.email}`);
        setFormData({
          email: "",
          username: "",
          roles: ["user"],
          primaryRole: "user",
          password: "",
          confirmPassword: "",
        });
        setShowForm(false);
        closeConfirmModal();
        await loadStaffData(); // Reload data
      } else {
        // If staff creation fails, we should ideally delete the auth user
        // But for now, just show error
        addNotification("error", "Staff Creation Failed", `User created but staff record failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error("Error creating staff:", error);

      // Handle Firebase Auth errors
      let errorMessage = "Error creating user account";
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email is already registered";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = `Error: ${error.message}`;
      }

      addNotification("error", "Creation Failed", errorMessage);
    }
    setLoading(false);
  };

  // Update staff
  const handleUpdateStaff = async () => {
    if (!editingStaff || !formData.email || !formData.username) {
      addNotification("warning", "Missing Fields", "Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const staffRef = doc(firestore, "staff", editingStaff.id);
      await updateDoc(staffRef, {
        email: formData.email,
        username: formData.username,
        roles: formData.roles,
        primaryRole: formData.primaryRole,
        updatedAt: new Date(),
      });

      addNotification("success", "Staff Updated", `Staff updated successfully: ${formData.email}`);
      setEditingStaff(null);
      setShowForm(false);
      closeConfirmModal();
      await loadStaffData(); // Reload data
    } catch (error) {
      addNotification("error", "Update Failed", `Error updating staff: ${error}`);
    }
    setLoading(false);
  };

  // Delete staff
  const handleDeleteStaff = async (staffId: string, email: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(firestore, "staff", staffId));
      addNotification("success", "Staff Deleted", `Staff deleted successfully: ${email}`);
      closeConfirmModal();
      await loadStaffData(); // Reload data
    } catch (error) {
      addNotification("error", "Delete Failed", `Error deleting staff: ${error}`);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEditStaff = (staff: Staff) => {
    openConfirmModal(
      "update",
      "Edit Staff Confirmation",
      `Are you sure you want to edit staff: ${staff.email}?`,
      () => {
        setEditingStaff(staff);
        setFormData({
          email: staff.email,
          username: staff.username,
          roles: staff.roles,
          primaryRole: staff.primaryRole,
          password: "",
          confirmPassword: "",
        });
        setShowForm(true);
        closeConfirmModal();
      },
      staff
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (editingStaff) {
      openConfirmModal("update", "Update Staff Confirmation", `Are you sure you want to update staff: ${formData.email}?`, handleUpdateStaff);
    } else {
      openConfirmModal("create", "Create Staff Confirmation", `Are you sure you want to create new staff: ${formData.email}?`, handleCreateStaff);
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (staff: Staff) => {
    openConfirmModal("delete", "Delete Staff Confirmation", `Are you sure you want to delete staff: ${staff.email}? This action cannot be undone.`, () => handleDeleteStaff(staff.id, staff.email), staff);
  };

  // Handle role change
  const handleRoleChange = (role: string, checked: boolean) => {
    let updatedRoles = [...formData.roles];

    if (checked) {
      if (!updatedRoles.includes(role)) {
        updatedRoles.push(role);
      }
    } else {
      updatedRoles = updatedRoles.filter((r) => r !== role);
    }

    setFormData({
      ...formData,
      roles: updatedRoles,
      primaryRole: updatedRoles.includes(formData.primaryRole) ? formData.primaryRole : updatedRoles[0] || "user",
    });
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingStaff(null);
    setFormData({
      email: "",
      username: "",
      roles: ["user"],
      primaryRole: "user",
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: "bg-red-50 text-red-700 border-red-200",
      operator: "bg-blue-50 text-blue-700 border-blue-200",
      petani: "bg-green-50 text-green-700 border-green-200",
      manager: "bg-purple-50 text-purple-700 border-purple-200",
      user: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Notifications */}
      <NotificationContainer notifications={notifications} onRemoveNotification={removeNotification} position="top-right" />

      {/* Confirm Modal */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
        isLoading={loading}
        staffInfo={
          confirmModal.staff
            ? {
                username: confirmModal.staff.username,
                email: confirmModal.staff.email,
              }
            : undefined
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Staff Management</h1>
              <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <FaPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add New Staff</span>
              <span className="sm:hidden">Add Staff</span>
            </button>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="w-4 h-4 text-blue-600" />
                </div>
                {editingStaff ? "Edit Staff Member" : "Create New Staff Member"}
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:text-gray-600"
                      placeholder="staff@example.com"
                      disabled={!!editingStaff}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Assign Roles *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {availableRoles.map((role) => (
                        <label key={role} className="flex items-center space-x-3 p-3 border-2 border-gray-300 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 bg-white">
                          <input
                            type="checkbox"
                            checked={formData.roles.includes(role)}
                            onChange={(e) => handleRoleChange(role, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-2 border-gray-400 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-sm font-medium text-gray-800 capitalize">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Role *</label>
                    <select
                      value={formData.primaryRole}
                      onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })}
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900"
                    >
                      {formData.roles.map((role) => (
                        <option key={role} value={role} className="capitalize text-gray-900">
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Password fields - only show when creating new staff */}
              {!editingStaff && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Enter password (min 6 characters)"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors">
                        {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword || ""}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full p-4 pr-12 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="Confirm password"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors">
                        {showConfirmPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                >
                  {loading ? "Processing..." : editingStaff ? "Update Staff" : "Create Staff"}
                </button>
                <button onClick={handleCancel} className="flex-1 sm:flex-none px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Staff Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {staffList.map((staff) => (
            <div key={staff.id} className="bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{staff.username}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <FaEnvelope className="w-3 h-3" />
                        {staff.email}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getRoleColor(staff.primaryRole)} shadow-sm`}>{staff.primaryRole.toUpperCase()}</span>
                </div>
              </div>

              {/* Card Main */}
              <div className="p-6">
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">Assigned Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {staff.roles.map((role) => (
                      <span key={role} className={`px-3 py-1 text-xs font-medium rounded-lg border ${getRoleColor(role)} shadow-sm`}>
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {staff.createdAt && (
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                    Created: {new Date(staff.createdAt.toDate ? staff.createdAt.toDate() : staff.createdAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleEditStaff(staff)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaEdit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(staff)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-medium rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <FaTrash className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {staffList.length === 0 && !loading && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaUser className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Staff Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by adding your first staff member or setup initial data to begin managing your team.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                Add First Staff
              </button>
              <button
                onClick={handleSetupInitialData}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <FaDatabase className="w-5 h-5" />
                Setup Initial Data
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && staffList.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Staff Data</h3>
            <p className="text-gray-600">Please wait while we fetch your team information...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;
