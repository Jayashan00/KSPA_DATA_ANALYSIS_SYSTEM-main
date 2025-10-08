import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header.jsx";
import Slidebar from "../../components/slidebar.jsx";
import { checklistAPI } from "../../services/api";
import { toast } from "react-hot-toast";

const ELocation3 = () => {
  const navigate = useNavigate();

  const sectionButtons = ["Current (A)", "Temperature(C)"];

  const machineData = {
    "Current (A)": [ "M3510-1", "M3510-2", "M3512-1", "M3512-2", "M3509-1", "M3509-2", "M3511-1", "M3511-2", "M3522-1", "M3522-2", "M3552-1", "M3552-2", "M3517-1", "M3517-2", "M3514-1", "M3514-2", "M3537-1", "M3537-2", "M3537-3", "M3540-1", "M3540-2", "M1171", "M3543-1", "M3543-2", "M3503-1", "M3503-2", "M3518-1", "M3518-2", "M3506-1", "M3506-2", "M3515", "M3513", "M3539", "M3542", "M3544", "M3550-1", "M3550-2", "M3549-1", "M3549-2", "New Agitator", "3502" ],
    "Temperature(C)": [ "M3510-1", "M3510-2", "M3512-1", "M3512-2", "M3509-1", "M3509-2", "M3511-1", "M3511-2", "M3522-1", "M3522-2", "M3552-1", "M3552-2", "M3517-1", "M3517-2", "M3514-1", "M3514-2", "M3537-1", "M3537-2", "M3537-3", "M3540-1", "M3540-2", "M1171", "M3543-1", "M3543-2", "M3503-1", "M3503-2", "M3518-1", "M3518-2", "M3506-1", "M3506-2", "M3515", "M3513", "M3539", "M3542", "M3544", "M3550-1", "M3550-2", "M3549-1", "M3549-2", "New Agitator", "3502" ],
  };

  const defaultFormData = { working: "", Full_Load_Current: "", Motor_Current: "", Remark: "", Body: "", Bearing: "", Cable_End: "", Non_Drive_Side: "" };

  const [selectedSection, setSelectedSection] = useState("Current (A)");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [addedMachines, setAddedMachines] = useState({});
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const machinesPerPage = 42;

  const machineButtons = machineData[selectedSection] || [];
  const totalPages = Math.ceil(machineButtons.length / machinesPerPage);
  const startIndex = (currentPage - 1) * machinesPerPage;
  const currentMachines = machineButtons.slice(startIndex, startIndex + machinesPerPage);
  const addedCurrentSection = Object.keys(addedMachines).filter((m) => machineButtons.includes(m)).length;
  const totalCurrentSection = machineButtons.length;

  useEffect(() => {
    loadSavedData();
  }, [selectedSection]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection("electrical", "e_location3", selectedSection);
      const savedEntries = {};
      response.data.forEach((entry) => {
        if (entry.status !== "APPROVED") {
          savedEntries[entry.machineName] = entry;
        }
      });
      setAddedMachines(savedEntries);
    } catch (error) {
      console.log("No saved data found");
      setAddedMachines({});
    } finally {
      setLoading(false);
    }
  };

  const handleMachineClick = (index) => {
    const machineName = machineButtons[startIndex + index];
    setCurrentMachineIndex(startIndex + index);
    setShowPopup(true);
    setFormData(addedMachines[machineName]?.formData || defaultFormData);
  };

  const handleSaveInPopup = async () => {
    const machineName = machineButtons[currentMachineIndex];
    if (!formData.working) {
      toast.error("Please select 'Working' or 'Not Working'.");
      return;
    }

    setLoading(true);
    try {
      const hour = new Date().getHours();
      const shift = hour >= 6 && hour < 18 ? "Day" : "Night";

      const checklistEntryPayload = {
        machineName,
        section: selectedSection,
        locationType: "electrical",
        locationId: "e_location3",
        subsection: selectedSection,
        shift,
        formData: { ...formData },
      };

      const existingEntry = addedMachines[machineName];

      if (existingEntry && existingEntry.id) {
        await checklistAPI.update(existingEntry.id, { ...existingEntry, ...checklistEntryPayload });
        toast.success(`Data updated for ${machineName}`);
      } else {
        await checklistAPI.create(checklistEntryPayload);
        toast.success(`Data saved for ${machineName}`);
      }

      await loadSavedData();

      if (currentMachineIndex < machineButtons.length - 1) {
        handleNextMachine();
      } else {
        setShowPopup(false);
      }
    } catch (error) {
      toast.error("Failed to save data. Please try again.");
      console.error("Save error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handleChange = (e) => { const { name, value } = e.target; setFormData((prev) => ({ ...prev, [name]: value })); };
  const handleClose = () => setShowPopup(false);
  const handlePrevMachine = () => { if (currentMachineIndex > 0) { const prevIndex = currentMachineIndex - 1; setCurrentMachineIndex(prevIndex); const machineName = machineButtons[prevIndex]; setFormData(addedMachines[machineName]?.formData || defaultFormData); } };
  const handleNextMachine = () => { if (currentMachineIndex < machineButtons.length - 1) { const nextIndex = currentMachineIndex + 1; setCurrentMachineIndex(nextIndex); const machineName = machineButtons[nextIndex]; setFormData(addedMachines[machineName]?.formData || defaultFormData); } };

  const isSectionFilled = addedCurrentSection === totalCurrentSection && totalCurrentSection > 0;

  const handleSave = () => {
    toast.success("Progress saved successfully!");
  };

  const handleSubmit = () => {
    if (!isSectionFilled) {
      toast.error("Please complete all machines in this section first.");
      return;
    }
    toast.success("Section submitted for approval!");
    navigate("/e_location");
  };

  const handleEdit = () => {
    const addedMachineKeys = Object.keys(addedMachines).filter((m) =>
      machineButtons.includes(m)
    );
    if (addedMachineKeys.length === 0) {
      toast.error("No machines have been filled yet to edit.");
      return;
    }
    const lastMachineName = addedMachineKeys[addedMachineKeys.length - 1];
    const index = machineButtons.indexOf(lastMachineName);

    if (index > -1) {
        setCurrentMachineIndex(index);
        setFormData(addedMachines[lastMachineName]?.formData || defaultFormData);
        setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-1">
        <div className="w-60 bg-white shadow-md">
          <Slidebar />
        </div>
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
            <div className="flex flex-wrap gap-3 sm:gap-6 mb-6 sm:mb-10">
              {sectionButtons.map((section, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedSection(section); setCurrentPage(1); }}
                  disabled={loading}
                  className={`min-w-[100px] sm:min-w-[140px] px-4 sm:px-6 py-2 ${selectedSection === section ? "bg-[#cc3300] scale-105 transform border-2 border-black" : "bg-gradient-to-r from-[#ff6600] to-[#cc3300]"} text-white rounded-2xl font-bold cursor-pointer text-xs sm:text-base shadow-md hover:opacity-90 text-center`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-10 justify-between">
              <button onClick={() => navigate("/e_location")} className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer text-xs sm:text-base hover:from-[#cc3300] hover:to-[#ff6600] transition-colors">
                Exit
              </button>
              <div className="text-xs sm:text-base font-semibold">
                Filled: {addedCurrentSection} / {totalCurrentSection}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 sm:gap-6 mb-8">
              {currentMachines.map((machine, index) => (
                <button
                  key={index}
                  onClick={() => handleMachineClick(index)}
                  disabled={loading}
                  className={`px-4 sm:px-6 py-2 border rounded-[10px] text-xs sm:text-base font-semibold text-center shadow-md ${addedMachines[machine] ? "bg-orange-400 hover:bg-orange-500" : "bg-white hover:bg-gray-100"}`}
                  style={{ borderColor: "#F26223" }}
                >
                  {machine}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-100 p-4 shadow-inner flex flex-col items-center gap-4 sticky bottom-0 z-10">
            <div className="flex justify-between items-center w-full max-w-4xl">
              <button onClick={handlePrevPage} disabled={currentPage === 1 || loading} className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base disabled:opacity-60">
                &lt; Previous
              </button>
              <div className="flex gap-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setCurrentPage(p)} disabled={loading} className={`px-4 py-2 font-semibold ${p === currentPage ? "border-2 border-black" : ""}`} style={{ borderRadius: 0, background: "transparent", cursor: "pointer" }}>
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={handleNextPage} disabled={currentPage === totalPages || loading} className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base disabled:opacity-60">
                Next &gt;
              </button>
            </div>
            <div className="flex gap-8 justify-center w-full max-w-4xl mt-2">
              <button onClick={handleSave} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer hover:from-[#cc3300] hover:to-[#ff6600]">
                {loading ? "Saving..." : "Save"}
              </button>
              <button onClick={handleEdit} disabled={loading} className={`px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer hover:from-[#cc3300] hover:to-[#ff6600] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                Edit
              </button>
              <button onClick={handleSubmit} disabled={!isSectionFilled || loading} className={`px-6 py-2 rounded-2xl font-bold text-white ${isSectionFilled && !loading ? "bg-gradient-to-r from-[#ff6600] to-[#cc3300] hover:from-[#cc3300] hover:to-[#ff6600]" : "bg-gray-400 cursor-not-allowed"}`}>
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-800 text-xl sm:text-2xl font-bold hover:text-black" onClick={handleClose}>&times;</button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4">{machineButtons[currentMachineIndex]}</h2>
            <div className="flex flex-col gap-3">
              <div className="flex justify-around gap-8 text-sm sm:text-base">
                {["Working", "Not Working"].map((val) => (
                  <label key={val} className="flex items-center gap-2"><input type="radio" name="working" value={val} checked={formData.working === val} onChange={handleChange} disabled={loading} />{val}</label>
                ))}
              </div>
              {selectedSection === "Current (A)" && (
                <>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Full Load Current (A):</label><div className="relative flex items-center"><input type="text" name="Full_Load_Current" value={formData.Full_Load_Current} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter value" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">A</span></div></div>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Motor Current (A):</label><div className="relative flex items-center"><input type="text" name="Motor_Current" value={formData.Motor_Current} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter value" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">A</span></div></div>
                  <div className="mb-3"><label className="block mb-2 text-sm sm:text-lg font-semibold">Remark</label><select name="remark" value={formData.remark} onChange={handleChange} className="border p-2 rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-orange-500 outline-none" disabled={loading}><option value="">add remark</option><option value="Oil Leak">Oil Leak</option><option value="Pulp Leak">Pulp Leak</option><option value="Gland Leak">Gland Leak</option><option value="Pneumatic Leak">Pneumatic Leak</option><option value="Mechanical Seal Leak">Mechanical Seal Leak</option><option value="Condensate Leak">Condensate Leak</option><option value="Steam Leak">Steam Leak</option><option value="Belts Loosed">Belts Loosed</option><option value="Abnormal Vibration">Abnormal Vibration </option><option value="Temperature High">Temperature High</option><option value="Abnormal Noise">Abnormal Noise</option><option value="Nut&Bolts Loosed">Nut&Bolts Loosed</option></select></div>
                </>
              )}
              {selectedSection === "Temperature(C)" && (
                <>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Body Temperature (°C):</label><div className="relative flex items-center"><input type="text" name="Body" value={formData.Body} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter temperature" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">°C</span></div></div>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Bearing Temperature (°C):</label><div className="relative flex items-center"><input type="text" name="Bearing" value={formData.Bearing} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter temperature" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">°C</span></div></div>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Cable End Temperature (°C):</label><div className="relative flex items-center"><input type="text" name="Cable_End" value={formData.Cable_End} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter temperature" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">°C</span></div></div>
                  <div className="mb-4"><label className="block mb-1 text-sm sm:text-base">Non Drive Side Temperature (°C):</label><div className="relative flex items-center"><input type="text" name="Non_Drive_Side" value={formData.Non_Drive_Side} onChange={handleChange} className="border p-2 rounded w-full pr-8 text-sm sm:text-lg" placeholder="Enter temperature" disabled={loading} /><span className="absolute right-2 text-gray-500 text-xs">°C</span></div></div>
                  <div className="mb-3"><label className="block mb-2 text-sm sm:text-lg font-semibold">Remark</label><select name="remark" value={formData.remark} onChange={handleChange} className="border p-2 rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-orange-500 outline-none" disabled={loading}><option value="">add remark</option><option value="Oil Leak">Oil Leak</option><option value="Pulp Leak">Pulp Leak</option><option value="Gland Leak">Gland Leak</option><option value="Pneumatic Leak">Pneumatic Leak</option><option value="Mechanical Seal Leak">Mechanical Seal Leak</option><option value="Condensate Leak">Condensate Leak</option><option value="Steam Leak">Steam Leak</option><option value="Belts Loosed">Belts Loosed</option><option value="Abnormal Vibration">Abnormal Vibration </option><option value="Temperature High">Temperature High</option><option value="Abnormal Noise">Abnormal Noise</option><option value="Nut&Bolts Loosed">Nut&Bolts Loosed</option></select></div>
                </>
              )}
              <button className="w-full mt-4 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white font-bold rounded-lg text-sm sm:text-base hover:opacity-90 disabled:opacity-60" onClick={handleSaveInPopup} disabled={loading}>
                {loading ? "Saving..." : "Save & Next"}
              </button>
              <div className="flex justify-between gap-3 mt-3">
                <button className="flex-1 py-2 bg-gray-400 text-white font-bold rounded-lg text-sm sm:text-base hover:bg-gray-500 disabled:opacity-50" onClick={handlePrevMachine} disabled={currentMachineIndex === 0 || loading}>
                  &lt; Previous
                </button>
                <button className="flex-1 py-2 bg-gray-400 text-white font-bold rounded-lg text-sm sm:text-base hover:bg-gray-500 disabled:opacity-50" onClick={handleNextMachine} disabled={currentMachineIndex === machineButtons.length - 1 || loading}>
                  Next &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELocation3;