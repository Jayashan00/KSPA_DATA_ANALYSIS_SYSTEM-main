import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/header.jsx";
import Slidebar from "../../components/slidebar.jsx";
import { checklistAPI } from "../../services/api";
import { toast } from "react-hot-toast";

// Reusable Remark Dropdown Component
const RemarkDropdown = ({ value, onChange, disabled }) => (
  <div className="mb-3">
    <label className="block mb-2 text-sm sm:text-lg font-semibold">Remark</label>
    <select
      name="remark"
      value={value}
      onChange={onChange}
      className="border p-2 rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-orange-500 outline-none"
      disabled={disabled}
    >
      <option value="">Add Remark</option>
      <option value="Oil Leak">Oil Leak</option>
      <option value="Pulp Leak">Pulp Leak</option>
      <option value="Gland Leak">Gland Leak</option>
      <option value="Pneumatic Leak">Pneumatic Leak</option>
      <option value="Mechanical Seal Leak">Mechanical Seal Leak</option>
      <option value="Condensate Leak">Condensate Leak</option>
      <option value="Steam Leak">Steam Leak</option>
      <option value="Belts Loosed">Belts Loosed</option>
      <option value="Abnormal Vibration">Abnormal Vibration</option>
      <option value="Temperature High">Temperature High</option>
      <option value="Abnormal Noise">Abnormal Noise</option>
      <option value="Nut&Bolts Loosed">Nut&Bolts Loosed</option>
    </select>
  </div>
);

const ELocation6 = () => {
  const navigate = useNavigate();

  const sectionButtons = ["Overhead Crane", "Monorail Hoist", "Transformers & 33kV Distribution Panel", "Compressor", "Boiler"];

  const machineData = {
    "Overhead Crane": ["OCC Chine Crane","Mill China Crane","Workshop German Crane","Mill German Crane"],
    "Monorail Hoist": ["Hydropulper Hoist","Starch Area Hoist"],
    "Transformers & 33kV Distribution Panel": ["33kV-Distribution Panel","33kV-Boiler(1.25MVA)","33kV-OCC 1(2MVA)","33kV-OCC 2(2.5MVA)","33kV-PM 1(2.5MVA)","33kV-PM 2(2.5MVA)"],
    Compressor: ["Boiler"],
    Boiler: ["ID Fan (F3)", "Primary FD Fan (F5)","Secondary FD Fan (F4)", "Grate Hyraulic Drive Pump (F6)", "Air Cooling Fan Grate (F7)", "Feed Water Pump 01 (F1)", "Feed Water Pump 02 (F2)", "Screw Feeder 01 (F8)",  "Screw Feeder 05 (F12)", "Screw Feeder 02 (F9)", "Screw Feeder 03 (F10)", "Screw Feeder 04 (F11)", "Water Circulation Pump Wet Scrubber (F18)", "Slurry Pump-Wet Scrubber (F19)", "RAV Below Jacketed SC-2 Bed Ash (F20)", "Jacketed Screw Conveyor SC-2 Bed Ash (F21)", "Jacketed Screw Conveyor SC-1 Bed Ash (F22)", "RAV Economiser 01 (F13)","RAV Economiser 02 (F14)", "RAV Cyclomax (F15)", "SRSB Economiser 01 (F16)", "SRSB Economiser 02 (F17)",  "Conveyor", "Conveyor Vibrator", "Deaerator Feed Water Pump 01", "Deaerator Feed Water Pump 02", "Fresh water Feed Pump (M1)", "Fresh water Feed Pump (M21)","Raw water feed pump to R0 (M3)" ],
  };

  const defaultFormOverhead = { working: "", forward: "", backward: "", left: "", right: "", up: "", down: "", limit: "", remark: "" };
  const defaultFormMonorail = { working: "", left: "", right: "", up: "", down: "", limit: "", remark: "" };
  const defaultFormBoilerCompressor = { hrMeter1: "", temp1: "", currentLoad1: "", currentNoLoad1: "", fanCurrent1: "", dryerStatus1: "", hrMeter2: "", temp2: "", currentLoad2: "", currentNoLoad2: "", fanCurrent2: "", dryerStatus2: "", remark: "" };
  const defaultFormTransformers1 = { roomTemperature: "", acVoltage: "", dcVoltage: "", incomingVoltage_P_N: "", remark: "" };
  const defaultFormTransformers2 = { roomTemperature: "", silicaGelColor: "", radiatorTransformerBodyCondition: "", remark: "" };
  const defaultFormBoiler = { motorCurrent:"", bodyTemp:"", bearingTemp:"", vibration:"", remark:"" };

  const getDefaultForm = (section, machine = null) => {
    if (section === "Overhead Crane") return defaultFormOverhead;
    if (section === "Monorail Hoist") return defaultFormMonorail;
    if (section === "Compressor") return defaultFormBoilerCompressor;
    if (section === "Transformers & 33kV Distribution Panel") {
      return machine === "33kV-Distribution Panel" ? defaultFormTransformers1 : defaultFormTransformers2;
    }
    if (section === "Boiler") return defaultFormBoiler;
    return { working: "", remark: "" };
  };

  const [selectedSection, setSelectedSection] = useState("Overhead Crane");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [addedMachines, setAddedMachines] = useState({});
  const [formData, setFormData] = useState(getDefaultForm("Overhead Crane"));
  const [loading, setLoading] = useState(false);
  const machinesPerPage = 49;
  const movementKeysOverhead = ["forward", "backward", "left", "right", "up", "down", "limit"];
  const movementKeysMonorail = ["left", "right", "up", "down", "limit"];

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
      const response = await checklistAPI.getByLocationAndSubsection("electrical", "e_location6", selectedSection);
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
    setFormData(addedMachines[machineName]?.formData || getDefaultForm(selectedSection, machineName));
  };

  const handleSaveInPopup = async () => {
    const machineName = machineButtons[currentMachineIndex];
    if (!formData.working && (selectedSection === "Overhead Crane" || selectedSection === "Monorail Hoist")) {
      toast.error("Please select a working status.");
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
        locationId: "e_location6",
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
  const handlePrevMachine = () => { if (currentMachineIndex > 0) { const prevIndex = currentMachineIndex - 1; setCurrentMachineIndex(prevIndex); const machineName = machineButtons[prevIndex]; setFormData(addedMachines[machineName]?.formData || getDefaultForm(selectedSection, machineName)); } };
  const handleNextMachine = () => { if (currentMachineIndex < machineButtons.length - 1) { const nextIndex = currentMachineIndex + 1; setCurrentMachineIndex(nextIndex); const machineName = machineButtons[nextIndex]; setFormData(addedMachines[machineName]?.formData || getDefaultForm(selectedSection, machineName)); } };

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
        setFormData(addedMachines[lastMachineName]?.formData || getDefaultForm(selectedSection, lastMachineName));
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
              {machineButtons.map((machine, index) => (
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

            {(selectedSection === "Overhead Crane" || selectedSection === "Monorail Hoist") && (
              <div className="flex flex-col gap-3">
                <div className="flex justify-around gap-8 text-sm sm:text-base">{["Working", "Not Working"].map((val) => (<label key={val} className="flex items-center gap-2"><input type="radio" name="working" value={val} checked={formData.working === val} onChange={handleChange} disabled={loading} />{val}</label>))}</div>
                {(selectedSection === "Overhead Crane" ? movementKeysOverhead : movementKeysMonorail).map((key) => (<div key={key} className="flex items-center gap-4"><label className="w-24 capitalize">{key}:</label><div className="flex gap-4">{["OK", "Not OK"].map(val => (<label key={val} className="flex items-center gap-1"><input type="radio" name={key} value={val} checked={formData[key] === val} onChange={handleChange} disabled={loading} />{val}</label>))}</div></div>))}
                <RemarkDropdown value={formData.remark} onChange={handleChange} disabled={loading} />
              </div>
            )}

            {selectedSection === "Boiler" && (
              <div className="flex flex-col gap-3">
                 <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Motor Current (A):</label><input type="text" name="motorCurrent" value={formData.motorCurrent} onChange={handleChange} className="border p-2 rounded w-full text-sm sm:text-lg" disabled={loading} /></div>
                 <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Body Temp (°C):</label><input type="text" name="bodyTemp" value={formData.bodyTemp} onChange={handleChange} className="border p-2 rounded w-full text-sm sm:text-lg" disabled={loading} /></div>
                 <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Bearing Temp (°C):</label><input type="text" name="bearingTemp" value={formData.bearingTemp} onChange={handleChange} className="border p-2 rounded w-full text-sm sm:text-lg" disabled={loading} /></div>
                 <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Vibration (mm/s):</label><input type="text" name="vibration" value={formData.vibration} onChange={handleChange} className="border p-2 rounded w-full text-sm sm:text-lg" disabled={loading} /></div>
                 <RemarkDropdown value={formData.remark} onChange={handleChange} disabled={loading} />
              </div>
            )}

            {selectedSection === "Transformers & 33kV Distribution Panel" && (
              machineButtons[currentMachineIndex] === "33kV-Distribution Panel" ? (
                <div className="flex flex-col gap-3">
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Room Temperature:</label><input type="text" name="roomTemperature" value={formData.roomTemperature} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">AC Voltage:</label><input type="text" name="acVoltage" value={formData.acVoltage} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">DC Voltage:</label><input type="text" name="dcVoltage" value={formData.dcVoltage} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Incoming Voltage P-N:</label><input type="text" name="incomingVoltage_P_N" value={formData.incomingVoltage_P_N} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <RemarkDropdown value={formData.remark} onChange={handleChange} disabled={loading} />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Room Temperature:</label><input type="text" name="roomTemperature" value={formData.roomTemperature} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Silica Gel Color:</label><input type="text" name="silicaGelColor" value={formData.silicaGelColor} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <div className="mb-2"><label className="block mb-1 text-sm sm:text-base">Radiator & Transformer Body Condition:</label><input type="text" name="radiatorTransformerBodyCondition" value={formData.radiatorTransformerBodyCondition} onChange={handleChange} className="border p-2 rounded w-full" disabled={loading} /></div>
                  <RemarkDropdown value={formData.remark} onChange={handleChange} disabled={loading} />
                </div>
              )
            )}

            {selectedSection === "Compressor" && (
                <div className="overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        <div>
                            <h3 className="text-center font-bold mb-2">Compressor 01</h3>
                            <div className="space-y-2">
                                {["hrMeter1", "temp1", "currentLoad1", "currentNoLoad1", "fanCurrent1"].map(field => <div key={field} className="flex items-center"><label className="w-40 font-semibold capitalize">{field.slice(0, -1).replace(/([A-Z])/g, ' $1')}:</label><input type="text" name={field} value={formData[field]} onChange={handleChange} className="border p-1 rounded w-full" /></div>)}
                                <div className="flex items-center"><label className="w-40 font-semibold">Dryer Status:</label><div className="flex gap-4">{["On", "Off"].map(val => <label key={val} className="flex items-center gap-1"><input type="radio" name="dryerStatus1" value={val} checked={formData.dryerStatus1 === val} onChange={handleChange} />{val}</label>)}</div></div>
                            </div>
                        </div>
                        <div className="border-t my-2"></div>
                        <div>
                             <h3 className="text-center font-bold mb-2">Compressor 02</h3>
                             <div className="space-y-2">
                                {["hrMeter2", "temp2", "currentLoad2", "currentNoLoad2", "fanCurrent2"].map(field => <div key={field} className="flex items-center"><label className="w-40 font-semibold capitalize">{field.slice(0, -1).replace(/([A-Z])/g, ' $1')}:</label><input type="text" name={field} value={formData[field]} onChange={handleChange} className="border p-1 rounded w-full" /></div>)}
                                <div className="flex items-center"><label className="w-40 font-semibold">Dryer Status:</label><div className="flex gap-4">{["On", "Off"].map(val => <label key={val} className="flex items-center gap-1"><input type="radio" name="dryerStatus2" value={val} checked={formData.dryerStatus2 === val} onChange={handleChange} />{val}</label>)}</div></div>
                            </div>
                        </div>
                         <div className="mt-2">
                            <RemarkDropdown value={formData.remark} onChange={handleChange} disabled={loading} />
                         </div>
                    </div>
                </div>
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
      )}
    </div>
  );
};

export default ELocation6;