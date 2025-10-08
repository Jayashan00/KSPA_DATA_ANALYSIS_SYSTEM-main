import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { checklistAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Location6 = () => {
  const navigate = useNavigate();

  const sectionButtons = ["Heat Recovery Unit", "Turbine Fan", "Blower"];

  const machineData = {
    "Heat Recovery Unit": [
      { header: "Heat Recovery Unit", machines: ["3120"] },
      { header: "Heat Recovery Unit 01", machines: ["3103", "3106", "3122"] },
      { header: "Heat Recovery Unit 02", machines: ["3110", "3107"] },
      { header: "Heat Recovery Unit 03", machines: ["3115", "3112"] },
    ],
    "Turbine Fan": [
      { header: "Turbine Fan 01", machines: ["2403"] },
      { header: "Turbine Fan 02", machines: ["2404"] },
      { header: "Turbine Fan 03", machines: ["2405"] },
    ],
    Blower: [
      { header: "Blower 01", machines: ["2401"] },
      { header: "Blower 02", machines: ["2402"] },
      { header: "TRoot Blower", machines: ["0"] },
    ],
  };

  const defaultFormHRUBlower = {
    working: "",
    motorVibrationDE: "",
    motorVibrationNDE: "",
    blowerVibrationDE: "",
    blowerVibrationNDE: "",
    blowerTempDE: "",
    blowerTempNDE: "",
    oil: "",
    oilPressure: "",
    belt: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormTurbineFan = {
    working: "",
    motorVibrationDE: "",
    motorVibrationNDE: "",
    blowerTempDE: "",
    blowerTempNDE: "",
    oil: "",
    oilPressure: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const getDefaultForm = (section) => {
    if (section === "Heat Recovery Unit" || section === "Blower") return defaultFormHRUBlower;
    return defaultFormTurbineFan;
  };

  const [selectedSection, setSelectedSection] = useState("Heat Recovery Unit");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [addedMachines, setAddedMachines] = useState({});
  const [formData, setFormData] = useState(getDefaultForm("Heat Recovery Unit"));
  const [popupMessage, setPopupMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const machinesPerPage = 49;

  const flattenedMachines = (machineData[selectedSection] || []).flatMap((item) => {
    return item.machines.map((machine) => ({
      machine,
      header: item.header,
    }));
  });

  const totalPages = Math.ceil(flattenedMachines.length / machinesPerPage);
  const startIndex = (currentPage - 1) * machinesPerPage;
  const currentMachines = flattenedMachines.slice(startIndex, startIndex + machinesPerPage);

  const currentPageHeaders = [];
  currentMachines.forEach((item) => {
    let headerGroup = currentPageHeaders.find((h) => h.header === item.header);
    if (!headerGroup) {
      headerGroup = { header: item.header, machines: [] };
      currentPageHeaders.push(headerGroup);
    }
    headerGroup.machines.push(item.machine);
  });

  const addedCurrentSection = Object.keys(addedMachines).filter((m) =>
    flattenedMachines.some((fm) => fm.machine === m)
  ).length;
  const totalCurrentSection = flattenedMachines.length;

  useEffect(() => {
    loadSavedData();
  }, [selectedSection]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection("mechanical", "location6", selectedSection);
      const savedData = {};
      response.data.forEach((entry) => {
        if (entry.status !== "APPROVED") {
          savedData[entry.machineName] = entry.formData;
        }
      });
      setAddedMachines(savedData);
    } catch (error) {
      console.log("No saved data found");
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleMachineClick = (index) => {
    const machineName = flattenedMachines[index].machine;
    setCurrentMachineIndex(index);
    setFormData(addedMachines[machineName] || getDefaultForm(selectedSection));
    setShowPopup(true);
    setPopupMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      [
        "motorVibrationDE",
        "motorVibrationNDE",
        "blowerVibrationDE",
        "blowerVibrationNDE",
        "blowerTempDE",
        "blowerTempNDE",
        "oilPressure",
      ].includes(name)
    ) {
      if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleClose = () => setShowPopup(false);

  const handlePrevMachine = () => {
    const prevIndex = currentMachineIndex > 0 ? currentMachineIndex - 1 : currentMachineIndex;
    setCurrentMachineIndex(prevIndex);
    const machineName = flattenedMachines[prevIndex].machine;
    setFormData(addedMachines[machineName] || getDefaultForm(selectedSection));
    setPopupMessage("");
  };

  const handleNextMachine = () => {
    const nextIndex =
      currentMachineIndex < flattenedMachines.length - 1 ? currentMachineIndex + 1 : currentMachineIndex;
    setCurrentMachineIndex(nextIndex);
    const machineName = flattenedMachines[nextIndex].machine;
    setFormData(addedMachines[machineName] || getDefaultForm(selectedSection));
    setPopupMessage("");
  };

  const handleAdd = async () => {
    const machineName = flattenedMachines[currentMachineIndex].machine;

    if (!formData.working) {
      toast.error("Please select Working or Not Working!");
      return;
    }

    if (formData.working === "Working") {
      const requiredFields = Object.keys(getDefaultForm(selectedSection)).filter(
        (f) => f !== "remark" && f !== "belt"
      );
      for (let field of requiredFields) {
        if (!formData[field]) {
          toast.error("Please fill in all fields before adding data!");
          return;
        }
      }
    } else if (formData.working === "Not Working") {
      const fields = Object.keys(getDefaultForm(selectedSection));
      const clearedData = { ...formData };
      fields.forEach((f) => {
        if (f !== "working" && f !== "remark" && f !== "belt") clearedData[f] = "";
      });
      setFormData(clearedData);
    }

    setLoading(true);
    try {
      // Determine shift based on current time
      const hour = new Date().getHours();
      const shift = hour >= 6 && hour < 18 ? "Day" : "Night";

      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const checklistEntry = {
        machineName,
        section: selectedSection,
        locationType: "mechanical",
        locationId: "location6",
        subsection: selectedSection,
        shift,
        technician: currentUser.name || "Unknown",
        formData: { ...formData },
        createdBy: currentUser.id || currentUser.empNumber,
      };

      await checklistAPI.create(checklistEntry);

      setAddedMachines((prev) => ({ ...prev, [machineName]: { ...formData } }));

      setPopupMessage(
        `Data added for ${machineName}. Next Machine: ${
          flattenedMachines[currentMachineIndex + 1]?.machine || "End of Section"
        }`
      );

      if (currentMachineIndex < flattenedMachines.length - 1) {
        const nextIndex = currentMachineIndex + 1;
        const nextMachineName = flattenedMachines[nextIndex].machine;
        setFormData(addedMachines[nextMachineName] || getDefaultForm(selectedSection));
        setCurrentMachineIndex(nextIndex);
      }

      toast.success(`Data saved for ${machineName}`);
    } catch (error) {
      toast.error("Failed to save data");
    } finally {
      setLoading(false);
    }

    const allFilled = Object.keys({
      ...addedMachines,
      [machineName]: { ...formData },
    }).filter((m) => flattenedMachines.some((fm) => fm.machine === m)).length === flattenedMachines.length;

    if (allFilled) {
      setShowPopup(false);
      setPopupMessage("");
    }
  };

  const isSectionFilled = addedCurrentSection === totalCurrentSection && totalCurrentSection > 0;

  const handleSave = async () => {
    toast.success("Progress saved successfully!");
  };

  const handleSubmit = async () => {
    if (!isSectionFilled) {
      toast.error("Please complete all machines in this section first");
      return;
    }

    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection("mechanical", "location6", selectedSection);
      if (!response.data || response.data.length === 0) {
        toast.error("No data found to submit");
        setLoading(false);
        return;
      }

      for (const entry of response.data) {
        await checklistAPI.update(entry.id, { ...entry, status: "APPROVED" });
      }
      toast.success(`All machine data submitted successfully for section: ${selectedSection}`);
      const remaining = { ...addedMachines };
      machineData[selectedSection].forEach((h) =>
        h.machines.forEach((m) => delete remaining[m])
      );
      setAddedMachines(remaining);
    } catch (error) {
      toast.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    const addedMachineKeys = Object.keys(addedMachines).filter((m) =>
      flattenedMachines.some((fm) => fm.machine === m)
    );

    if (addedMachineKeys.length === 0) {
      toast.error("No machines added to edit. Please add data first.");
      return;
    }

    // Select the last added machine for editing
    const lastMachine = addedMachineKeys[addedMachineKeys.length - 1];
    const index = flattenedMachines.findIndex((fm) => fm.machine === lastMachine);

    setCurrentMachineIndex(index);
    setFormData(addedMachines[lastMachine] || getDefaultForm(selectedSection));
    setShowPopup(true);
    setPopupMessage(`Editing data for ${lastMachine}`);
  };

  const radioLabelStyle = "flex items-center gap-4 font-sans text-lg font-semibold";

  if (loading && Object.keys(addedMachines).length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

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
              {sectionButtons.map((section, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedSection(section);
                    setCurrentPage(1);
                  }}
                  disabled={loading}
                  className={`min-w-[100px] sm:min-w-[140px] px-4 sm:px-6 py-2 ${
                    selectedSection === section
                      ? "bg-[#cc3300] scale-105 transform border-2 border-black"
                      : "bg-gradient-to-r from-[#ff6600] to-[#cc3300]"
                  } text-white rounded-2xl font-bold cursor-pointer text-xs sm:text-base shadow-md hover:opacity-90 text-center`}
                >
                  {section}
                </button>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-10 justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <button className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-black font-semibold rounded-md text-xs sm:text-base hover:bg-gray-200">
                  Filters
                </button>
                <button
                  onClick={() => navigate("/location")}
                  className="px-4 sm:px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer text-xs sm:text-base hover:from-[#cc3300] hover:to-[#ff6600] transition-colors"
                >
                  Exit
                </button>
              </div>
              <div className="text-xs sm:text-base font-semibold">
                Showing {addedCurrentSection}-{totalCurrentSection} of {flattenedMachines.length}
              </div>
            </div>
            {currentPageHeaders.map((headerObj, hIndex) => (
              <div key={hIndex} className="mb-8">
                <h2 className="font-bold text-lg mb-4">{headerObj.header}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3 sm:gap-6">
                  {headerObj.machines.map((machine, index) => {
                    const globalIndex = flattenedMachines.findIndex(
                      (fm) => fm.machine === machine
                    );
                    const isAdded = addedMachines[machine];
                    return (
                      <button
                        key={index}
                        onClick={() => handleMachineClick(globalIndex)}
                        disabled={loading}
                        className={`px-4 sm:px-6 py-2 border rounded-[10px] text-xs sm:text-base font-semibold text-center shadow-md ${
                          isAdded ? "bg-orange-400 hover:bg-orange-500" : "bg-white hover:bg-gray-100"
                        }`}
                        style={{ borderColor: "#F26223" }}
                      >
                        {machine}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-100 p-4 shadow-inner flex flex-col items-center gap-4 sticky bottom-0 z-10">
            <div className="flex justify-between items-center w-full max-w-4xl">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base disabled:opacity-60"
              >
                &lt; Previous
              </button>
              <div className="flex gap-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    disabled={loading}
                    className={`px-4 py-2 font-semibold ${
                      page === currentPage ? "border-2 border-black" : ""
                    }`}
                    style={{ borderRadius: 0, background: "transparent", cursor: "pointer" }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base disabled:opacity-60"
              >
                Next &gt;
              </button>
            </div>
            <div className="flex gap-8 justify-center w-full max-w-4xl mt-2">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer hover:from-[#cc3300] hover:to-[#ff6600]"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleEdit}
                disabled={loading}
                className={`px-6 py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white rounded-2xl font-bold cursor-pointer hover:from-[#cc3300] hover:to-[#ff6600] ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isSectionFilled || loading}
                className={`px-6 py-2 rounded-2xl font-bold text-white ${
                  isSectionFilled && !loading
                    ? "bg-gradient-to-r from-[#ff6600] to-[#cc3300] hover:from-[#cc3300] hover:to-[#ff6600]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-800 text-xl sm:text-2xl font-bold hover:text-black z-10"
              onClick={handleClose}
            >
              &times;
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">
              {flattenedMachines[currentMachineIndex].header}
            </h2>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-3 sm:mb-4">
              {flattenedMachines[currentMachineIndex].machine}
            </h2>
            {popupMessage && (
              <div className="mb-3 sm:mb-4 text-green-600 font-semibold text-center text-sm sm:text-base">
                {popupMessage}
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2 sm:gap-0">
              {["Working", "Not Working"].map((val) => (
                <label key={val} className={`${radioLabelStyle} flex-1 text-center`}>
                  <input
                    type="radio"
                    name="working"
                    value={val}
                    checked={formData.working === val}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {val}
                </label>
              ))}
            </div>
            {selectedSection === "Turbine Fan" ? (
              <>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Motor Vibration (mm/s)</h3>
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      name="motorVibrationDE"
                      placeholder="DE"
                      value={formData.motorVibrationDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      name="motorVibrationNDE"
                      placeholder="NDE"
                      value={formData.motorVibrationNDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Blower Temperature (°C)</h3>
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      name="blowerTempDE"
                      placeholder="DE"
                      value={formData.blowerTempDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      name="blowerTempNDE"
                      placeholder="NDE"
                      value={formData.blowerTempNDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Oil Level</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["High", "Moderate", "Low"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="oil"
                          value={val}
                          checked={formData.oil === val}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Oil Pressure (P)</label>
                  <input
                    type="text"
                    name="oilPressure"
                    value={formData.oilPressure}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Motor Vibration (mm/s)</h3>
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      name="motorVibrationDE"
                      placeholder="DE"
                      value={formData.motorVibrationDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      name="motorVibrationNDE"
                      placeholder="NDE"
                      value={formData.motorVibrationNDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Blower Vibration (mm/s)</h3>
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      name="blowerVibrationDE"
                      placeholder="DE"
                      value={formData.blowerVibrationDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      name="blowerVibrationNDE"
                      placeholder="NDE"
                      value={formData.blowerVibrationNDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Blower Temperature (°C)</h3>
                  <div className="flex gap-2 sm:gap-4 mb-3">
                    <input
                      type="text"
                      name="blowerTempDE"
                      placeholder="DE"
                      value={formData.blowerTempDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                    <input
                      type="text"
                      name="blowerTempNDE"
                      placeholder="NDE"
                      value={formData.blowerTempNDE}
                      onChange={handleChange}
                      className="border p-2 rounded w-full text-sm sm:text-lg"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Oil Level</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["High", "Moderate", "Low"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="oil"
                          value={val}
                          checked={formData.oil === val}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <h3 className="block mb-2 text-base sm:text-lg font-semibold">Belt Condition</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["OK", "Not OK"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="belt"
                          value={val}
                          checked={formData.belt === val}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Oil Pressure (P)</label>
                  <input
                    type="text"
                    name="oilPressure"
                    value={formData.oilPressure}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="block mb-2 text-base sm:text-lg font-semibold">Cleanliness</label>
              <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                {["Good", "Normal", "Bad"].map((val) => (
                  <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                    <input
                      type="radio"
                      name="cleanliness"
                      value={val}
                      checked={formData.cleanliness === val}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-2 text-base sm:text-lg font-semibold">Noise</label>
              <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                {["Good", "Normal", "Bad"].map((val) => (
                  <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                    <input
                      type="radio"
                      name="noise"
                      value={val}
                      checked={formData.noise === val}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {val}
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-2 text-xs sm:text-sm md:text-lg font-semibold">
                Remark
              </label>
              <select
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="Enter remarks"
                disabled={loading}
                >
                <option value="">add remark</option>
                <option value="Oil Leak">Oil Leak</option>
                <option value="Pulp Leak">Pulp Leak</option>
                <option value="Gland Leak">Gland Leak</option>
                <option value="Pneumatic Leak">Pneumatic Leak</option>
                <option value="Mechanical Seal Leak">Mechanical Seal Leak</option>
                <option value="Condensate Leak">Condensate Leak</option>
                <option value="Steam Leak">Steam Leak</option>
                <option value="Belts Loosed">Belts Loosed</option>
                <option value="Abnormal Vibration">Abnormal Vibration </option>
                <option value="Temperature High">Temperature High</option>
                <option value="Abnormal Noise">Abnormal Noise</option>
                <option value="Nut&Bolts Loosed">Nut&Bolts Loosed</option>
              </select>
            </div>
            <button
              className="w-full py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white font-bold rounded-lg mb-3 hover:from-[#cc3300] hover:to-[#ff6600] text-sm sm:text-base"
              onClick={handleAdd}
              disabled={loading}
            >
              {loading ? "Adding..." : "ADD"}
            </button>
            <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
              <button
                className="flex-1 py-2 bg-gray-400 text-white font-bold rounded-lg text-sm sm:text-base"
                onClick={handlePrevMachine}
                disabled={loading}
              >
                &lt; Previous
              </button>
              <button
                className="flex-1 py-2 bg-gray-400 text-white font-bold rounded-lg text-sm sm:text-base"
                onClick={handleNextMachine}
                disabled={loading}
              >
                Next &gt;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Location6;