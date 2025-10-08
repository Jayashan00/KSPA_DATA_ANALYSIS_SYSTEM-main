import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { checklistAPI } from "../services/api";
import { toast } from "react-hot-toast";

const Location1 = () => {
  const navigate = useNavigate();

  const sectionButtons = ["Dryer Roller 1", "Dryer Roller 2", "Gear Box"];

  const machineData = {
    "Dryer Roller 2": [
      { header: "Top Wire", machines: ["TBR", "TWGR", "TTR 01", "TTR 02", "CR", "TFDR"] },
      {
        header: "Bottom Wire",
        machines: ["BBR","BWR 01","BWGR 01","BTR 01","BTR 02","BTR 03","BWR 02","BFDR","SCR"],
      },
      {
        header: "Press",
        machines: [
          "SPR","TPR 01","BPR 01","TPR 02","BPR 02","TPR 03","BPR 03","PFR 01","PFR 02","PFR 03",
          "PFR 04","PFR 05","PFR 06","PFR 07","PFR 08","PFR 09","PFR 10","PFR 11","PFR 12","PFR 13",
          "PFR 14","PFR 15","PFGR 01 ","PFGR 02","PFGR 03","PFGR 04","PFGR 05","PFGR 06","PFGR 07",
          "PFGR 08","PFGR 09","PFGR 10","PFGR 11","PFGR 12","PFGR 13","PFGR 14","PFGR 15","PFGR 16",
          "PFGR 17","PFGR 18","PFGR 19","PFGR 20","PFGR 21","PFGR 22",
        ],
      },
      { header: "Gear Box", machines: ["SPTR", "SPBR", "SPGR 01 ", "SPGR 02", "SPGR 03"] },
    ],

    "Dryer Roller 1": [
      "UN 01","UN 02","UN 03","UN 04","1","2","3","4","5","6","7","8","9","10","11","12","13",
      "14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30",
      "31","32","33","34","35","36","37","38","39",
    ],

    "Gear Box": [
      { header: "Press Section", machines: ["A014","A015","A013 ","A012","A011","A016","A017","A018","A019","A020","A021"] },
      { header: "Pre Dryer Section", machines: ["A022","A023","A024 ","A025","A026"] },
      { header: "Size Press Section", machines: ["A027", "A028"] },
      { header: "Post Dryer Section", machines: ["A029","A031","A030 ","A032","A033"] },
      { header: "Calender Section", machines: ["A034", "A035"] },
      { header: "Rewinder Section", machines: ["B007", "B001", "B002"] },
    ],
  };

  // Default form structures
  const defaultFormGearbox = {
    working: "",
    temperature: "",
    oil: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormDryerRoller1 = {
    working: "",
    lubeDrive: "",
    lubeOp: "",
    bearingDrive: "",
    bearingOp: "",
    belt: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  const defaultFormDryerRoller2 = {
    working: "",
    TempDrive: "",
    TempOp: "",
    VibraDrive: "",
    VibraOp: "",
    cleanliness: "",
    noise: "",
    remark: "",
  };

  // Helper to return form structure per section
  const getDefaultForm = (section) => {
    if (section === "Gear Box") return defaultFormGearbox;
    if (section === "Dryer Roller 1") return defaultFormDryerRoller1;
    return defaultFormDryerRoller2;
  };

  const [selectedSection, setSelectedSection] = useState("Dryer Roller 1");
  const [currentPage, setCurrentPage] = useState(1);
  const machinesPerPage = 49;
  const [showPopup, setShowPopup] = useState(false);
  const [currentMachineIndex, setCurrentMachineIndex] = useState(0);
  const [addedMachines, setAddedMachines] = useState({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(getDefaultForm("Dryer Roller 1"));
  const [popupMessage, setPopupMessage] = useState("");

  const radioLabelStyle =
    "flex items-center gap-4 font-sans text-lg font-semibold";

  // Flatten machines
  const flattenedMachines = (machineData[selectedSection] || []).flatMap(
    (item) => {
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
    }
  );

  const totalPages = Math.ceil(flattenedMachines.length / machinesPerPage);
  const startIndex = (currentPage - 1) * machinesPerPage;
  const currentMachines = flattenedMachines.slice(
    startIndex,
    startIndex + machinesPerPage
  );

  // Group machines by header
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

  // Load saved data on component mount
  useEffect(() => {
    loadSavedData();
  }, [selectedSection]);

  const loadSavedData = async () => {
    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection(
        "mechanical",
        "location1",
        selectedSection
      );

      const savedData = {};
      response.data.forEach(entry => {
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
      ["temperature"].includes(name) &&
      (value === "" || /^[0-9]*\.?[0-9]*$/.test(value))
    ) {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleClose = () => setShowPopup(false);

  const handlePrevMachine = () => {
    const prevIndex =
      currentMachineIndex > 0 ? currentMachineIndex - 1 : currentMachineIndex;
    setCurrentMachineIndex(prevIndex);
    const machineName = flattenedMachines[prevIndex].machine;
    setFormData(addedMachines[machineName] || getDefaultForm(selectedSection));
    setPopupMessage("");
  };

  const handleNextMachine = () => {
    const nextIndex =
      currentMachineIndex < flattenedMachines.length - 1
        ? currentMachineIndex + 1
        : currentMachineIndex;
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
        (f) => f !== "remark"
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
        if (f !== "working" && f !== "remark") clearedData[f] = "";
      });
      setFormData(clearedData);
    }

    setLoading(true);
    try {
      // Determine shift based on current time
      const hour = new Date().getHours();
      const shift = hour >= 6 && hour < 18 ? "Day" : "Night";

      // Save to backend
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const checklistEntry = {
        machineName,
        section: selectedSection,
        locationType: "mechanical",
        locationId: "location1",
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
        setFormData(
          addedMachines[nextMachineName] || getDefaultForm(selectedSection)
        );
        setCurrentMachineIndex(nextIndex);
      }

      toast.success(`Data saved for ${machineName}`);
    } catch (error) {
      toast.error("Failed to save data");
    } finally {
      setLoading(false);
    }

    const allFilled =
      Object.keys({ ...addedMachines, [machineName]: { ...formData } }).filter(
        (m) => flattenedMachines.some((fm) => fm.machine === m)
      ).length === flattenedMachines.length;
    if (allFilled) {
      setShowPopup(false);
      setPopupMessage("");
    }
  };

  const isSectionFilled =
    Object.keys(addedMachines).filter((m) =>
      flattenedMachines.some((fm) => fm.machine === m)
    ).length === totalCurrentSection && totalCurrentSection > 0;

  const handleSubmit = async () => {
    if (!isSectionFilled) {
      toast.error("Please complete all machines in this section first");
      return;
    }

    setLoading(true);
    try {
      const response = await checklistAPI.getByLocationAndSubsection(
        "mechanical",
        "location1",
        selectedSection
      );

      if (!response.data || response.data.length === 0) {
        toast.error("No data found to submit");
        setLoading(false);
        return;
      }

      for (const entry of response.data) {
        await checklistAPI.update(entry.id, { ...entry, status: "APPROVED" });
      }

      toast.success(`All machine data submitted successfully for section: ${selectedSection}`);

      // Clear the data for this section
      const remaining = { ...addedMachines };
      flattenedMachines.forEach(fm => delete remaining[fm.machine]);
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
          {/* Top Controls */}
          <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 sm:py-6">
            {/* Section Buttons */}
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

            {/* Filters + Exit */}
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

            {/* Machine Grid */}
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
                          isAdded
                            ? "bg-orange-400 hover:bg-orange-500"
                            : "bg-white hover:bg-gray-100"
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

          {/* Pagination + Submit fixed bottom */}
          <div className="bg-gray-100 p-4 shadow-inner flex flex-col items-center gap-4 sticky bottom-0 z-10">
            <div className="flex justify-between items-center w-full max-w-4xl">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base"
              >
                &lt; Previous
              </button>
              <div className="flex gap-4">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`px-4 py-2 font-semibold ${
                        page === currentPage ? "border-2 border-black" : ""
                      }`}
                      style={{
                        borderRadius: 0,
                        background: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 bg-[#8F8D93] text-white font-bold cursor-pointer text-sm sm:text-base"
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

      {/* Popup Form */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg relative bg-white max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-800 text-2xl font-bold hover:text-black z-10"
              onClick={handleClose}
            >
              &times;
            </button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2">
              {flattenedMachines[currentMachineIndex].header || ""}
            </h2>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-4">
              {flattenedMachines[currentMachineIndex].machine}
            </h2>
            {/* Popup Message */}
            {popupMessage && (
              <div className="mb-4 text-green-600 font-semibold text-center text-sm sm:text-base">
                {popupMessage}
              </div>
            )}
            {/* Common: Working / Not Working */}
            <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2 sm:gap-0">
              {["Working", "Not Working"].map((val) => (
                <label key={val} className={`${radioLabelStyle} flex-1 text-center`}>
                  <input
                    type="radio"
                    name="working"
                    value={val}
                    checked={formData.working === val}
                    onChange={handleChange}
                  />{" "}
                  {val}
                </label>
              ))}
            </div>
            {/* Conditional form fields based on selected section */}
            {selectedSection === "Gear Box" && (
              <>
                <div className="mb-3">
                  <label className="block mb-1 font-sans text-base sm:text-lg font-semibold">Oil Level / Greasing</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {["High","Moderate","Low"].map(level => (
                      <label key={level} className={`${radioLabelStyle} flex-1 min-w-[80px] text-center`}>
                        <input type="radio" name="oil" value={level} checked={formData.oil===level} onChange={handleChange}/>
                        {level}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-sans text-base sm:text-lg font-semibold">Temperature (°C)</label>
                  <input type="text" name="temperature" value={formData.temperature} onChange={handleChange} className="border p-2 rounded w-full font-sans text-base sm:text-lg"/>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-sans text-base sm:text-lg font-semibold">Cleanliness</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {["Good","Normal","Bad"].map(val => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[80px] text-center`}>
                        <input type="radio" name="cleanliness" value={val} checked={formData.cleanliness===val} onChange={handleChange}/>
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-sans text-base sm:text-lg font-semibold">Noise</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                    {["Good","Normal","Bad"].map(val => (
                      <label key={val} className={`${radioLabelStyle} flex-1 min-w-[80px] text-center`}>
                        <input type="radio" name="noise" value={val} checked={formData.noise===val} onChange={handleChange}/>
                        {val}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label className="block mb-1 font-sans text-base sm:text-lg font-semibold">Remark</label>
                  <input type="text" name="remark" value={formData.remark} onChange={handleChange} className="border p-2 rounded w-full font-sans text-base sm:text-lg"/>
                </div>
              </>
            )}
            {selectedSection === "Dryer Roller 1" && (
              <>
                <div className="text-center block mb-2 text-base sm:text-lg font-semibold">Lube Oil Level</div>
                {/* Drive */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Drive</label>
                  <div className="flex flex-wrap flex-1 gap-2 sm:gap-4 justify-start sm:justify-start">
                    {["High", "Moderate", "Low"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[70px] justify-center">
                        <input
                          type="radio"
                          name="lubeDrive"
                          value={val}
                          checked={formData.lubeDrive === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Operation Side */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Operation Side</label>
                  <div className="flex flex-wrap flex-1 gap-2 sm:gap-4 justify-start sm:justify-start">
                    {["High", "Moderate", "Low"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[70px] justify-center">
                        <input
                          type="radio"
                          name="lubeOp"
                          value={val}
                          checked={formData.lubeOp === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="text-center block mb-2 text-base sm:text-lg font-semibold">Bearing Temperature</div>
                {/* Drive Temperature */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Drive</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="bearingDrive"
                      value={formData.bearingDrive}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">°C</span>
                  </div>
                </div>
                {/* Operation Side Temperature */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Operation Side</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="bearingOp"
                      value={formData.bearingOp}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">°C</span>
                  </div>
                </div>
                {/* Belt Condition */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Belt Condition:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {["OK", "Not OK"].map((val) => (
                      <label key={val} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="belt"
                          value={val}
                          checked={formData.belt === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Cleanliness */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Cleanliness:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[60px] justify-center">
                        <input
                          type="radio"
                          name="cleanliness"
                          value={val}
                          checked={formData.cleanliness === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Noise */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Noise:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[60px] justify-center">
                        <input
                          type="radio"
                          name="noise"
                          value={val}
                          checked={formData.noise === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Remark */}
                <div className="mb-3">
                  <label className="block mb-2 text-xs sm:text-sm md:text-lg font-semibold">
                    Remark
                  </label>
                  <select
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    className="border p-2 rounded-lg w-full text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-orange-500 outline-none"
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
            {selectedSection === "Dryer Roller 2" && (
              <>
                <div className="text-center block mb-2 text-base sm:text-lg font-semibold">Temperature</div>
                {/* Drive */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Drive Side</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="TempDrive"
                      value={formData.TempDrive}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">°C</span>
                  </div>
                </div>
                {/* Operation Side */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Operation Side</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="TempOp"
                      value={formData.TempOp}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">°C</span>
                  </div>
                </div>
                <div className="text-center block mb-2 text-base sm:text-lg font-semibold">Vibration</div>
                {/* Drive Vibration */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Drive Side</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="VibraDrive"
                      value={formData.VibraDrive}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">mm/s</span>
                  </div>
                </div>
                {/* Operation Side Vibration */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Operation Side</label>
                  <div className="relative flex-1 flex items-center w-full">
                    <input
                      type="text"
                      name="VibraOp"
                      value={formData.VibraOp}
                      onChange={handleChange}
                      className="border p-2 rounded w-full pr-8 text-xs sm:text-sm"
                    />
                    <span className="absolute right-2 text-gray-500 text-xs">mm/s</span>
                  </div>
                </div>
                {/* Cleanliness */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Cleanliness:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[60px] justify-center">
                        <input
                          type="radio"
                          name="cleanliness"
                          value={val}
                          checked={formData.cleanliness === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Noise */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 mb-4">
                  <label className="w-full sm:w-36 font-semibold text-sm sm:text-base">Noise:</label>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    {["Good", "Normal", "Bad"].map((val) => (
                      <label key={val} className="flex items-center gap-2 flex-1 min-w-[60px] justify-center">
                        <input
                          type="radio"
                          name="noise"
                          value={val}
                          checked={formData.noise === val}
                          onChange={handleChange}
                        />
                        <span className="text-xs sm:text-sm">{val}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {/* Remark */}
                <div className="mb-3">
                  <label className="block mb-2 text-xs sm:text-sm md:text-lg font-semibold">
                    Remark
                  </label>
                  <select
                    name="remark"
                    value={formData.remark}
                    onChange={handleChange}
                    className="border p-2 rounded-lg w-full text-xs sm:text-sm md:text-base focus:ring-2 focus:ring-orange-500 outline-none"
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

export default Location1;