import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { useAuth } from "../context/AuthContext";
import { userAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Human = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(members.length / itemsPerPage);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    empNumber: "",
    fullName: "",
    nic: "",
    phoneNumber: "",
    email: "",
    role: ["technician"], // default role
    type: "",
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      setMembers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const paginatedMembers = members.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setFormData({ ...formData, role: [value] });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();

    // Only check password match if password is provided (for new users or password updates)
    if (!editingId && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (editingId && formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const userData = {
        empNumber: formData.empNumber,
        fullName: formData.fullName,
        nic: formData.nic,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        role: formData.role,
        type: formData.type,
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }

      if (editingId) {
        await userAPI.updateUser(editingId, userData);
        toast.success("User updated successfully");
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users");
          return;
        }
        userData.password = formData.password;
        await userAPI.createUser(userData);
        toast.success("User created successfully");
      }

      handleCloseForm();
      fetchUsers();
    } catch (error) {
      console.error('Operation error:', error);
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await userAPI.deleteUser(id);
        toast.success("User deleted successfully");
        fetchUsers();
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleUpdate = (member) => {
    setFormData({
      empNumber: member.empNumber,
      fullName: member.fullName,
      nic: member.nic,
      phoneNumber: member.phoneNumber,
      email: member.email,
      role: Array.from(member.roles || []).map(role => role.replace('ROLE_', '').toLowerCase()),
      type: member.type,
      password: "",
      confirmPassword: ""
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      empNumber: "",
      fullName: "",
      nic: "",
      phoneNumber: "",
      email: "",
      role: ["technician"],
      type: "",
      password: "",
      confirmPassword: ""
    });
    setEditingId(null);
  };

  if (!isAdmin()) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">Access Denied - Admin Only</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row flex-1">
        <div className="hidden md:block md:w-1/4 lg:w-1/5">
          <Slidebar />
        </div>

        <div className="flex-1 px-2 py-6 sm:px-4 sm:py-8 flex flex-col gap-6 h-[calc(100vh-64px)]">
          <div className="flex justify-start mb-4">
            <button
              className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer"
              onClick={() => setShowForm(true)}
            >
              Add Member
            </button>
          </div>

          {/* Modal Form */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg relative">
                <button
                  className="absolute top-2 right-2 text-gray-800 text-2xl font-bold hover:text-black"
                  onClick={handleCloseForm}
                >
                  &times;
                </button>

                <div className="flex items-center justify-center mb-4 gap-3">
                  <img src="/logo.png" alt="Logo" className="w-12" />
                  <h2 className="text-2xl font-bold">
                    {editingId ? "UPDATE MEMBER" : "ADD MEMBER"}
                  </h2>
                </div>

                <form onSubmit={handleAddMember} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Full Name:</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Employee ID:</label>
                    <input
                      type="text"
                      name="empNumber"
                      value={formData.empNumber}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">NIC:</label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Phone:</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Role:</label>
                    <div className="flex gap-4 w-2/3">
                      <label>
                        <input
                          type="radio"
                          value="admin"
                          checked={formData.role.includes("admin")}
                          onChange={handleRoleChange}
                        /> Admin
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="engineer"
                          checked={formData.role.includes("engineer")}
                          onChange={handleRoleChange}
                        /> Engineer
                      </label>
                      <label>
                        <input
                          type="radio"
                          value="technician"
                          checked={formData.role.includes("technician")}
                          onChange={handleRoleChange}
                        /> Technician
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Type:</label>
                    <div className="flex gap-4 w-2/3">
                      <label>
                        <input
                          type="radio"
                          name="type"
                          value="ELECTRICAL"
                          checked={formData.type === "ELECTRICAL"}
                          onChange={handleChange}
                        /> Electrical
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="type"
                          value="MECHANICAL"
                          checked={formData.type === "MECHANICAL"}
                          onChange={handleChange}
                        /> Mechanical
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Password:</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required={!editingId}
                      placeholder={editingId ? "Leave blank to keep current password" : ""}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Confirm Password:</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3 text-[16px]"
                      required={!editingId}
                      placeholder={editingId ? "Leave blank to keep current password" : ""}
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer mt-2"
                  >
                    {editingId ? "UPDATE" : "ADD"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Members Table */}
          <div className="bg-white rounded shadow-md w-full flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-start mb-4 p-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-black font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5h18v2H3V5zm5 6h8v2H8v-2zm3 6h2v2h-2v-2z" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex-1 px-4 overflow-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Name</th>
                    <th className="border border-gray-300 p-2 text-left">Employee ID</th>
                    <th className="border border-gray-300 p-2 text-left">NIC</th>
                    <th className="border border-gray-300 p-2 text-left">Phone</th>
                    <th className="border border-gray-300 p-2 text-left">Email</th>
                    <th className="border border-gray-300 p-2 text-left">Role</th>
                    <th className="border border-gray-300 p-2 text-left">Type</th>
                    <th className="border border-gray-300 p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center p-4 text-gray-500">No members available.</td>
                    </tr>
                  ) : (
                    paginatedMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="border border-gray-300 p-2">{member.fullName}</td>
                        <td className="border border-gray-300 p-2">{member.empNumber}</td>
                        <td className="border border-gray-300 p-2">{member.nic}</td>
                        <td className="border border-gray-300 p-2">{member.phoneNumber}</td>
                        <td className="border border-gray-300 p-2">{member.email}</td>
                        <td className="border border-gray-300 p-2">
                          {Array.from(member.roles || []).map(role => role.replace('ROLE_', '')).join(', ')}
                        </td>
                        <td className="border border-gray-300 p-2">{member.type}</td>
                        <td className="border border-gray-300 p-2 flex gap-2">
                          <button
                            onClick={() => handleUpdate(member)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#8F8D93] to-[#5E5C62] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 p-4">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#8F8D93] to-[#5E5C62] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
              >
                &lt; Previous
              </button>

              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 font-semibold ${page === currentPage ? "border-black border-[2px]" : "border-none"}`}
                    style={{ borderRadius: 0, background: "transparent", cursor: "pointer" }}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#8F8D93] to-[#5E5C62] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Human;