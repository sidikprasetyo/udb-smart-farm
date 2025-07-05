"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebaseAuth";
import { createStaffWithRoles, StaffRoleData } from "@/lib/userRoleUtils";
import { FaEdit, FaTrash, FaPlus, FaUser, FaEnvelope } from "react-icons/fa";

interface Staff extends StaffRoleData {
  id: string;
  createdAt?: any;
  updatedAt?: any;
}

const StaffManagement = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<StaffRoleData>({
    email: "",
    username: "",
    roles: ["user"],
    primaryRole: "user",
  });

  const availableRoles = ["admin", "operator", "petani", "manager", "user"];

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
          ...(doc.data() as StaffRoleData),
        });
      });

      setStaffList(staffData);
      setMessage(`Loaded ${staffData.length} staff records`);
    } catch (error) {
      setMessage(`Error loading staff: ${error}`);
      console.error("Error loading staff:", error);
    }
    setLoading(false);
  };

  // Load data on component mount
  useEffect(() => {
    loadStaffData();
  }, []);

  // Create new staff
  const handleCreateStaff = async () => {
    if (!formData.email || !formData.username) {
      setMessage("❌ Please fill in email and username");
      return;
    }

    setLoading(true);
    try {
      const result = await createStaffWithRoles(formData);
      if (result.success) {
        setMessage(`✅ Staff created successfully: ${formData.email}`);
        setFormData({
          email: "",
          username: "",
          roles: ["user"],
          primaryRole: "user",
        });
        setShowForm(false);
        await loadStaffData(); // Reload data
      } else {
        setMessage(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    }
    setLoading(false);
  };

  // Update staff
  const handleUpdateStaff = async () => {
    if (!editingStaff || !formData.email || !formData.username) {
      setMessage("❌ Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const staffRef = doc(firestore, "staff", editingStaff.id);
      await updateDoc(staffRef, {
        ...formData,
        updatedAt: new Date(),
      });

      setMessage(`✅ Staff updated successfully: ${formData.email}`);
      setEditingStaff(null);
      setShowForm(false);
      await loadStaffData(); // Reload data
    } catch (error) {
      setMessage(`❌ Error updating staff: ${error}`);
    }
    setLoading(false);
  };

  // Delete staff
  const handleDeleteStaff = async (staffId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete staff: ${email}?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(firestore, "staff", staffId));
      setMessage(`✅ Staff deleted successfully: ${email}`);
      await loadStaffData(); // Reload data
    } catch (error) {
      setMessage(`❌ Error deleting staff: ${error}`);
    }
    setLoading(false);
  };

  // Handle edit
  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      email: staff.email,
      username: staff.username,
      roles: staff.roles,
      primaryRole: staff.primaryRole,
    });
    setShowForm(true);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (editingStaff) {
      handleUpdateStaff();
    } else {
      handleCreateStaff();
    }
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
    });
  };

  // Get role color
  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      admin: "bg-red-100 text-red-800 border-red-200",
      operator: "bg-blue-100 text-blue-800 border-blue-200",
      petani: "bg-green-100 text-green-800 border-green-200",
      manager: "bg-purple-100 text-purple-800 border-purple-200",
      user: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <FaPlus className="w-4 h-4" />
          Add New Staff
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("✅") ? "bg-green-100 text-green-800 border border-green-200" : message.includes("❌") ? "bg-red-100 text-red-800 border border-red-200" : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">{editingStaff ? "Edit Staff" : "Create New Staff"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="staff@example.com"
                disabled={!!editingStaff} // Disable email editing
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username *</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Roles *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {availableRoles.map((role) => (
                <label key={role} className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input type="checkbox" checked={formData.roles.includes(role)} onChange={(e) => handleRoleChange(role, e.target.checked)} className="rounded" />
                  <span className="text-sm capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Primary Role *</label>
            <select value={formData.primaryRole} onChange={(e) => setFormData({ ...formData, primaryRole: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {formData.roles.map((role) => (
                <option key={role} value={role} className="capitalize">
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? "Processing..." : editingStaff ? "Update Staff" : "Create Staff"}
            </button>
            <button onClick={handleCancel} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Staff Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <div key={staff.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{staff.username}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaEnvelope className="w-3 h-3" />
                      {staff.email}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRoleColor(staff.primaryRole)}`}>{staff.primaryRole.toUpperCase()}</span>
              </div>
            </div>

            {/* Card Main */}
            <div className="p-4">
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-600">All Roles:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {staff.roles.map((role) => (
                    <span key={role} className={`px-2 py-1 text-xs font-medium rounded-md border ${getRoleColor(role)}`}>
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {staff.createdAt && <p className="text-xs text-gray-400">Created: {new Date(staff.createdAt.toDate ? staff.createdAt.toDate() : staff.createdAt).toLocaleDateString()}</p>}
            </div>

            {/* Card Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <button onClick={() => handleEditStaff(staff)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                  <FaEdit className="w-3 h-3" />
                  Edit
                </button>
                <button onClick={() => handleDeleteStaff(staff.id, staff.email)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                  <FaTrash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {staffList.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaUser className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Staff Found</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first staff member.</p>
          <button onClick={() => setShowForm(true)} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add First Staff
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && staffList.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading staff data...</p>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
