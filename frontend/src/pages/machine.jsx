import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { machineAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Machine = () => {
  const [machines, setMachines] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    section: "",
    engineer: "",
  });

  // Fetch machines on component mount
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await machineAPI.getAll();
      setMachines(response.data);
    } catch (error) {
      toast.error("Failed to fetch machines");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(machines.length / itemsPerPage);
  const paginatedMachines = machines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (editingId) {
        await machineAPI.update(editingId, formData);
        toast.success("Machine updated successfully");
      } else {
        await machineAPI.create(formData);
        toast.success("Machine created successfully");
      }

      await fetchMachines();
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data || "Failed to save machine");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      setLoading(true);
      try {
        await machineAPI.delete(id);
        toast.success("Machine deleted successfully");
        await fetchMachines();
      } catch (error) {
        toast.error("Failed to delete machine");
      } finally {
        setLoading(false);
      }
    }
  };

  const handlePrev = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNext = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ name: "", location: "", section: "", engineer: "" });
    setEditingId(null);
  };

  const handleEdit = (machine) => {
    setFormData({
      name: machine.name,
      location: machine.location,
      section: machine.section,
      engineer: machine.engineer,
    });
    setEditingId(machine.id);
    setShowForm(true);
  };

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
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ name: "", location: "", section: "", engineer: "" });
              }}
              disabled={loading}
            >
              Add Machine
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
                    {editingId ? "Update Machine" : "Add Machine"}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Name:</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Location:</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Section:</label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="border p-2 rounded w-2/3"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-1/3 text-[18px]">Related Engineer:</label>
                    <div className="flex gap-4 w-2/3 text-[18px]">
                      <label>
                        <input
                          type="radio"
                          name="engineer"
                          value="Electrical"
                          checked={formData.engineer === "Electrical"}
                          onChange={handleChange}
                        /> Electrical
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="engineer"
                          value="Mechanical"
                          checked={formData.engineer === "Mechanical"}
                          onChange={handleChange}
                        /> Mechanical
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : (editingId ? "Update" : "Add")}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Machines Table */}
          <div className="bg-white rounded shadow-md flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-start mb-4 p-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-black font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5h18v2H3V5zm5 6h8v2H8v-2zm3 6h2v2h-2v-2z" />
                </svg>
                Filters
              </button>
            </div>

            <div className="flex-1 px-4 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="text-lg">Loading...</div>
                </div>
              ) : (
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">Name</th>
                      <th className="border border-gray-300 p-2 text-left">Location</th>
                      <th className="border border-gray-300 p-2 text-left">Section</th>
                      <th className="border border-gray-300 p-2 text-left">Engineer</th>
                      <th className="border border-gray-300 p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMachines.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center p-4 text-gray-500">No machines available.</td>
                      </tr>
                    ) : (
                      paginatedMachines.map((machine) => (
                        <tr key={machine.id}>
                          <td className="border border-gray-300 p-2">{machine.name}</td>
                          <td className="border border-gray-300 p-2">{machine.location}</td>
                          <td className="border border-gray-300 p-2">{machine.section}</td>
                          <td className="border border-gray-300 p-2">{machine.engineer}</td>
                          <td className="border border-gray-300 p-2">
                            <div className="flex gap-2">
                              <button
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
                                onClick={() => handleEdit(machine)}
                                disabled={loading}
                              >
                                Update
                              </button>
                              <button
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#8F8D93] to-[#5E5C62] text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base"
                                onClick={() => handleDelete(machine.id)}
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
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

export default Machine;