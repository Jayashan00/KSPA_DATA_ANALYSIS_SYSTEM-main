import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { checklistAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Location4 = () => {
  const navigate = useNavigate();

  const sectionButtons = [
    "Pump",
    "Hydraulic & Lubrication units",
    "Agitator",
    "Compressor",
    "Dryer",
  ];

  const machineData = {
    Pump: [
      { header: "Condensate pumps", machines: ["P2904-1","P2904-2","P2907-1","P2907-2","P2910-1","P2910-2","P2913-1","P2913-2","P2915-1","P2915-2","P2918-1","P2918-2","P2922-1","P2922-2","P2920-1","P2920-2"] },
      { header: "Separator tank pumps", machines: ["P2413","P2412","P2411","P2410","P2409","P2408","P2407","P2406"] },
      { header: "Wet broke tank", machines: ["P2603","P2602"] },
      { header: "Top wire white water tank", machines: ["P2210","P2212"] },
      { header: "Base wire white water tank", machines: ["P2115","P2216"] },
      { header: "Clean water tank", machines: ["P2505-1","P2505-2","P2509-1","P2509-2","P2503-1","P2503-2","P2507","P2110","P2111","P2215"] },
      { header: "White water tank", machines: ["P1167","P1168"] },
      { header: "C2212", machines: ["P2212"] },
      { header: "Bottom layer fan pump", machines: ["P2206"] },
      { header: "C2208", machines: ["P2209"] },
      { header: "Top layer fan pump", machines: ["P2106"] },
      { header: "Semi dry broke pump", machines: ["P2605","P2607"] },
      { header: "Dry broke tank", machines: ["P2609"] },
      { header: "C2510", machines: ["P2511"] },
      { header: "E22303-M4", machines: ["0"] },
    ],
    "Hydraulic & Lubrication units": [
      "Z2301-83",
      "Z2301-82",
      "New Unit",
      "Z2301-80",
      "Z2301-79",
      "Z2301-78",
      "Z2301-81",
    ],
    Agitator: [
      { header: "Wet Broke Tank", machines: ["E2602"] },
      { header: "Semi Dry Broke Tank", machines: ["E2604"] },
      { header: "Dry Broke Tank", machines: ["E2606", "E2608"] },
    ],
    Compressor: ["Compressor 01", "Compressor 02"],
    Dryer: ["Dryer 01", "Dryer 02"],
  };

  const defaultFormPump = {
    working: "",
    temperature: "",
    oil: "",
    vibration: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormHydraulic = {
    working: "",
    oilLevel: "",
    oilTempIn: "",
    oilTempOut: "",
    coolingIn: "",
    coolingOut: "",
    oilPressure: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormAgitator = {
    working: "",
    bearTempDrive: "",
    bearTempDriven: "",
    greasingDrive: "",
    greasingDriven: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormDryer = {
    working: "",
    refHighPressure: "",
    refHighPressureUnit: "P",
    refLowPressure: "",
    refLowPressureUnit: "P",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormCompressor = {
    working: "",
    runningStatus: "",
    totalRunHours: "",
    totalRunHoursUnit: "hrs",
    totalRunMins: "",
    totalRunMinsUnit: "min",
    thisTimeRunHours: "",
    thisTimeRunHoursUnit: "hrs",
    thisTimeRunMins: "",
    thisTimeRunMinsUnit: "min",
    airTemperature: "",
    airTemperatureUnit: "C",
    airPressure: "",
    airPressureUnit: "P",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const getDefaultForm = (section) => {
    if (section === "Hydraulic & Lubrication units") return defaultFormHydraulic;
    if (section === "Agitator") return defaultFormAgitator;
    if (section === "Dryer") return defaultFormDryer;
    if (section === "Compressor") return defaultFormCompressor;
    return defaultFormPump;
  };

  const [selectedSection, setSelectedSection] = useState("Pump");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [addedMachines, setAddedMachines] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(getDefaultForm("Pump"));
  const [popupMessage, setPopupMessage] = useState("");
  const machinesPerPage = 24;

  const flattenedMachines = (machineData[selectedSection] || []).flatMap((item) => {
    if (typeof item === "string") {
      return [{ machine: item }];
    }
    if (Array.isArray(item.machines)) {
      return item.machines.map((machine) => ({
        machine,
        header: item.header,
      }));
    }
    return [];
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
      const response = await checklistAPI.getByLocationAndSubsection("mechanical", "location4", selectedSection);
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
    if ([
      "temperature", "vibration", "oilTempIn", "oilTempOut", "coolingIn", "coolingOut",
      "oilPressure", "bearTempDrive", "bearTempDriven", "greasingDrive", "greasingDriven",
      "refHighPressure", "refLowPressure", "airTemperature", "airPressure",
      "totalRunHours", "totalRunMins", "thisTimeRunHours", "thisTimeRunMins"
    ].includes(name)) {
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
        (f) => f !== "remark" && !f.includes("Unit")
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
        if (f !== "working" && f !== "remark" && !f.includes("Unit")) clearedData[f] = "";
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
        locationId: "location4",
        subsection: selectedSection,
        shift,
        technician: currentUser.name || "Unknown",
        formData: { ...formData },
        createdBy: currentUser.id || currentUser.empNumber
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

    const allFilled = Object.keys({ ...addedMachines, [machineName]: { ...formData } }).filter(
      (m) => flattenedMachines.some((fm) => fm.machine === m)
    ).length === flattenedMachines.length;
    if (allFilled) {
      setShowPopup(false);
      setPopupMessage("");
    }
  };

  const isSectionFilled = addedCurrentSection === totalCurrentSection && totalCurrentSection > 0;

  const handleSubmit = async () => {
    if (!isSectionFilled) {
      toast.error("Please complete all machines in this section first");
      return;
    }

    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection("mechanical", "location4", selectedSection);
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
        (h.machines || [h]).forEach((m) => delete remaining[m])
      );
      setAddedMachines(remaining);
    } catch (error) {
      toast.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    toast.success("Progress saved successfully!");
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
                <h2 className="font-bold text-lg mb-4">{headerObj.header || selectedSection}</h2>
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
          <div className="rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md relative bg-white max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-800 text-xl sm:text-2xl font-bold hover:text-black z-10"
              onClick={handleClose}
            >
              &times;
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">
              {flattenedMachines[currentMachineIndex].header || selectedSection}
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
                  />
                  {val}
                </label>
              ))}
            </div>
            {selectedSection === "Hydraulic & Lubrication units" ? (
              <>
                <h3 className="block mb-2 text-base sm:text-lg font-semibold">Oil Level</h3>
                <div className="flex flex-wrap gap-2 sm:gap-8 justify-center mb-3">
                  {["High", "Moderate", "Low"].map((level) => (
                    <label key={level} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                      <input
                        type="radio"
                        name="oilLevel"
                        value={level}
                        checked={formData.oilLevel === level}
                        onChange={handleChange}
                      />
                      {level}
                    </label>
                  ))}
                </div>
                <h3 className="text-center block mb-2 text-base sm:text-lg font-semibold">Oil Temperature</h3>
                <div className="flex gap-2 sm:gap-4 mb-3">
                  <input
                    type="text"
                    name="oilTempIn"
                    placeholder="In (°C)"
                    value={formData.oilTempIn}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                  <input
                    type="text"
                    name="oilTempOut"
                    placeholder="Out (°C)"
                    value={formData.oilTempOut}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
                <h3 className="text-center block mb-2 text-base sm:text-lg font-semibold">
                  Cooling Water Temperature
                </h3>
                <div className="flex gap-2 sm:gap-4 mb-3">
                  <input
                    type="text"
                    name="coolingIn"
                    placeholder="In (°C)"
                    value={formData.coolingIn}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                  <input
                    type="text"
                    name="coolingOut"
                    placeholder="Out (°C)"
                    value={formData.coolingOut}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Oil Pressure (P)</label>
                  <input
                    type="text"
                    name="oilPressure"
                    value={formData.oilPressure}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
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
              </>
            ) : selectedSection === "Agitator" ? (
              <>
                <h3 className="text-center block mb-2 text-base sm:text-lg font-semibold">Bearing Temperature</h3>
                <div className="flex gap-2 sm:gap-4 mb-3">
                  <input
                    type="text"
                    name="bearTempDrive"
                    placeholder="Drive (°C)"
                    value={formData.bearTempDrive}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                  <input
                    type="text"
                    name="bearTempDriven"
                    placeholder="Driven (°C)"
                    value={formData.bearTempDriven}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
                <h3 className="text-center block mb-2 text-base sm:text-lg font-semibold">Greasing</h3>
                <div className="flex gap-2 sm:gap-4 mb-3">
                  <input
                    type="text"
                    name="greasingDrive"
                    placeholder="Drive (°C)"
                    value={formData.greasingDrive}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                  <input
                    type="text"
                    name="greasingDriven"
                    placeholder="Driven (°C)"
                    value={formData.greasingDriven}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
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
              </>
            ) : selectedSection === "Compressor" ? (
              <>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Running Status</label>
                  <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
                    {["OK", "Not OK"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="runningStatus"
                          value={val}
                          checked={formData.runningStatus === val}
                          onChange={handleChange}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Total Run Hours</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="totalRunHours"
                        value={formData.totalRunHours}
                        onChange={handleChange}
                        className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                      />
                      <select
                        name="totalRunHoursUnit"
                        value={formData.totalRunHoursUnit}
                        onChange={handleChange}
                        className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                      >
                        <option value="hrs">hrs</option>
                        <option value="days">days</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="totalRunMins"
                        value={formData.totalRunMins}
                        onChange={handleChange}
                        className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                      />
                      <select
                        name="totalRunMinsUnit"
                        value={formData.totalRunMinsUnit}
                        onChange={handleChange}
                        className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                      >
                        <option value="min">min</option>
                        <option value="sec">sec</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">This Time Run</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="thisTimeRunHours"
                        value={formData.thisTimeRunHours}
                        onChange={handleChange}
                        className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                      />
                      <select
                        name="thisTimeRunHoursUnit"
                        value={formData.thisTimeRunHoursUnit}
                        onChange={handleChange}
                        className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                      >
                        <option value="hrs">hrs</option>
                        <option value="days">days</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="thisTimeRunMins"
                        value={formData.thisTimeRunMins}
                        onChange={handleChange}
                        className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                      />
                      <select
                        name="thisTimeRunMinsUnit"
                        value={formData.thisTimeRunMinsUnit}
                        onChange={handleChange}
                        className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                      >
                        <option value="min">min</option>
                        <option value="sec">sec</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Air Temperature</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="airTemperature"
                      value={formData.airTemperature}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                    />
                    <select
                      name="airTemperatureUnit"
                      value={formData.airTemperatureUnit}
                      onChange={handleChange}
                      className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                    >
                      <option value="Celsius">°C</option>
                      <option value="Fahrenheit">°F</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Air Pressure</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="airPressure"
                      value={formData.airPressure}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                    />
                    <select
                      name="airPressureUnit"
                      value={formData.airPressureUnit}
                      onChange={handleChange}
                      className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                    >
                      <option value="P">P</option>
                      <option value="Bar">Bar</option>
                      <option value="Psi">Psi</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Cleanliness</label>
                  <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="cleanliness"
                          value={val}
                          checked={formData.cleanliness === val}
                          onChange={handleChange}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Noise</label>
                  <div className="flex flex-wrap gap-2 sm:gap-6 justify-center">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="noise"
                          value={val}
                          checked={formData.noise === val}
                          onChange={handleChange}
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
              </>
            ) : selectedSection === "Dryer" ? (
              <>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Running Status</label>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["OK", "Not OK"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center text-xs sm:text-sm`}>
                        <input
                          type="radio"
                          name="runningStatus"
                          value={val}
                          checked={formData.runningStatus === val}
                          onChange={handleChange}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Ref. High Pressure</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="refHighPressure"
                      value={formData.refHighPressure}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                    />
                    <select
                      name="refHighPressureUnit"
                      value={formData.refHighPressureUnit}
                      onChange={handleChange}
                      className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                    >
                      <option value="P">P</option>
                      <option value="Bar">Bar</option>
                      <option value="Psi">Psi</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Ref. Low Pressure</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="refLowPressure"
                      value={formData.refLowPressure}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-16 text-sm sm:text-lg"
                    />
                    <select
                      name="refLowPressureUnit"
                      value={formData.refLowPressureUnit}
                      onChange={handleChange}
                      className="absolute right-1 top-1 bottom-1 border-l p-1 bg-white text-xs sm:text-sm"
                    >
                      <option value="P">P</option>
                      <option value="Bar">Bar</option>
                      <option value="Psi">Psi</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Cleanliness</label>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center text-xs sm:text-sm`}>
                        <input
                          type="radio"
                          name="cleanliness"
                          value={val}
                          checked={formData.cleanliness === val}
                          onChange={handleChange}
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
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center text-xs sm:text-sm`}>
                        <input
                          type="radio"
                          name="noise"
                          value={val}
                          checked={formData.noise === val}
                          onChange={handleChange}
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
              </>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Temperature (°C)</label>
                  <input
                    type="text"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Oil Level or Greasing</label>
                  <div className="flex flex-wrap gap-2 sm:gap-8 justify-center">
                    {["High", "Moderate", "Low"].map((level) => (
                      <label key={level} className={`${radioLabelStyle} flex-1 min-w-[70px] text-center`}>
                        <input
                          type="radio"
                          name="oil"
                          value={level}
                          checked={formData.oil === level}
                          onChange={handleChange}
                        />
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-2 text-base sm:text-lg font-semibold">Vibration (mm/s)</label>
                  <input
                    type="text"
                    name="vibration"
                    value={formData.vibration}
                    onChange={handleChange}
                    className="border p-2 rounded w-full text-sm sm:text-lg"
                  />
                </div>
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
              </>
            )}
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

export default Location4;