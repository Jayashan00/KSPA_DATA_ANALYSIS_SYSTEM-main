import React, { useState, useEffect } from "react";
import Header from "../components/header";
import Slidebar from "../components/slidebar";
import { useNavigate, useLocation } from "react-router-dom";

const Checklist = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read shift from URL if present
  const queryParams = new URLSearchParams(location.search);
  const shiftFromUrl = queryParams.get("shift");

  // Determine initial shift based on time or URL
  const getInitialShift = () => {
    if (shiftFromUrl) return shiftFromUrl;
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? "Day" : "Night";
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRoute, setTargetRoute] = useState("");
  const [shift, setShift] = useState(getInitialShift());
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [engineerName, setEngineerName] = useState("");
  const [abcShift, setAbcShift] = useState("");

  const steps = [1, 2, 3, 4];

  // Auto-update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // STEP 0 - Select Checklist Type
  const Step0 = () => (
    <div className="bg-white p-6 sm:p-8 rounded-md shadow flex flex-col sm:flex-row gap-4 flex-wrap justify-center w-full max-w-lg">
      <button
        className="
          bg-gradient-to-r from-[#ff6600] to-[#cc3300]
          text-white font-semibold tracking-wide
          px-6 py-3 rounded-2xl shadow-md
          transition-all duration-300 ease-in-out
          w-full sm:w-auto
          hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
          focus:outline-none focus:ring-offset-2 focus:ring-orange-500
          active:scale-95
        "
        onClick={() => {
          setTargetRoute("/location");
          nextStep();
        }}
      >
        Mechanical Checklist
      </button>

      <button
        className="
          bg-gradient-to-r from-[#ff6600] to-[#cc3300]
          text-white font-semibold tracking-wide
          px-6 py-3 rounded-2xl shadow-md
          transition-all duration-300 ease-in-out
          w-full sm:w-auto
          hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
          focus:outline-none focus:ring-offset-2 focus:ring-orange-500
          active:scale-95
        "
        onClick={() => {
          setTargetRoute("/e_location");
          nextStep();
        }}
      >
        Electrical Checklist
      </button>
    </div>
  );

  // STEP 1 - Show Date + Time
  const Step1 = () => (
    <div className="bg-white p-6 sm:p-8 rounded-md shadow flex flex-col items-center gap-4 w-full max-w-lg overflow-x-auto">
      <table className="border-collapse w-full min-w-[300px] text-sm sm:text-base">
        <tbody>
          <tr className="bg-gray-100">
            <td
              rowSpan="3"
              className="border border-gray-400 p-4 font-bold text-center align-middle"
            >
              PM Checklist
              <br />
              <span className="text-xs text-gray-600">CL/PM/03</span>
            </td>
            <td className="border border-gray-400 p-3 flex justify-between items-center">
              <span className="font-bold">Date</span>
              <span>{currentDateTime.toLocaleDateString()}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-3 flex justify-between items-center">
              <span className="font-bold">Time</span>
              <span>{currentDateTime.toLocaleTimeString()}</span>
            </td>
          </tr>
          <tr>
            <td className="border border-gray-400 p-3 flex justify-between items-center">
              <span className="font-bold">Machine Speed</span>
              <button className="text-blue-600 hover:underline">View</button>
            </td>
          </tr>
        </tbody>
      </table>

      <button
        className="
          bg-gradient-to-r from-[#ff6600] to-[#cc3300]
          text-white font-semibold tracking-wide
          px-6 py-3 rounded-2xl shadow-md
          transition-all duration-300 ease-in-out
          w-full sm:w-auto
          hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
          focus:outline-none focus:ring-offset-2 focus:ring-orange-500
          active:scale-95
        "
        onClick={nextStep}
      >
        Next
      </button>
    </div>
  );

  // STEP 2 - Show Engineer, Technician, Shift
  const Step2 = () => (
    <div className="bg-white p-6 sm:p-8 rounded-md shadow flex flex-col items-center gap-4 w-full max-w-lg overflow-x-auto">
      <table className="border-collapse w-full min-w-[300px] text-sm sm:text-base">
        <tbody>
          {/* Shift Engineer Row */}
          <tr className="bg-gray-100">
            <td className="border border-gray-400 p-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="font-bold">Shift Engineer</span>
                <input
                  type="text"
                  placeholder="Enter engineer name"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="border p-2 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </td>
          </tr>

          {/* Technician Row */}
          <tr>
            <td className="border border-gray-400 p-3">
              <div className="flex justify-between items-center">
                <span className="font-bold">Technician</span>
                <button className="text-blue-600 hover:underline">View</button>
              </div>
            </td>
          </tr>

          {/* Shift Selection Row */}
            <tr className="bg-gray-100">
              <td className="border border-gray-400 p-3">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <span className="font-bold flex-shrink-0 min-w-[60px]">Shift</span>
                  <select
                    className="border p-2 rounded-lg flex-1 min-w-[100px] focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                    value={abcShift}
                    onChange={(e) => setAbcShift(e.target.value)}
                  >
                    <option value="">Select shift</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </td>
            </tr>
        </tbody>
      </table>


      <button
        className="
          bg-gradient-to-r from-[#ff6600] to-[#cc3300]
          text-white font-semibold tracking-wide
          px-6 py-3 rounded-2xl shadow-md
          transition-all duration-300 ease-in-out
          w-full sm:w-auto
          hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
          focus:outline-none focus:ring-offset-2 focus:ring-orange-500
          active:scale-95
        "
        onClick={nextStep}
      >
        Next
      </button>
    </div>
  );

  // STEP 3 - Select Day/Night
  const Step3 = () => {
    const isDayShift = shift === "Day";
    return (
      <div className="bg-white p-6 sm:p-8 rounded-md shadow flex flex-col sm:flex-row gap-4 justify-center w-full max-w-lg">
        <button
          className={`bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white px-4 py-2 rounded font-bold w-full sm:w-auto ${
            !isDayShift ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            setShift("Day");
            navigate(`${targetRoute}?shift=Day`);
          }}
          disabled={!isDayShift}
        >
          Day
        </button>
        <button
          className={`bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white px-4 py-2 rounded font-bold w-full sm:w-auto ${
            isDayShift ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => {
            setShift("Night");
            navigate(`${targetRoute}?shift=Night`);
          }}
          disabled={isDayShift}
        >
          Night
        </button>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step0 />;
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex flex-col md:flex-row">
        <div className="hidden md:block md:w-1/4 lg:w-1/5">
          <Slidebar />
        </div>

        <div className="flex-1 p-4 sm:p-8 flex flex-col items-center">
          {/* Progress Bar */}
          <div className="flex flex-wrap items-center justify-center mb-8 gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step}>
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold bg-white
                  ${
                    index < currentStep
                      ? "border-green-600 text-green-600"
                      : index === currentStep
                      ? "border-orange-500 text-orange-500"
                      : "border-gray-300 text-black"
                  }`}
                >
                  {index < currentStep ? "✔" : step}
                </div>
                {index < steps.length - 1 && (
                  <div className="h-[2px] w-8 sm:w-[50px] bg-gray-300"></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {renderStepContent()}

          {currentStep > 0 && (
            <div className="mt-4 w-full max-w-lg flex space-x-6 justify-between">
              <button
                onClick={prevStep}
                className="
                  bg-gradient-to-r from-[#ff6600] to-[#cc3300]
                  text-white font-semibold tracking-wide
                  px-6 py-3 rounded-2xl shadow-md
                  transition-all duration-300 ease-in-out
                  w-full sm:w-auto
                  hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
                  focus:outline-none focus:ring-offset-2 focus:ring-orange-500
                  active:scale-95
                "
              >
                Previous
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="
                  bg-gradient-to-r from-[#ff6600] to-[#cc3300]
                  text-white font-semibold tracking-wide
                  px-6 py-3 rounded-2xl shadow-md
                  transition-all duration-300 ease-in-out
                  w-full sm:w-auto
                  hover:scale-105 hover:shadow-lg hover:from-[#ff8533] hover:to-[#e64d00]
                  focus:outline-none focus:ring-offset-2 focus:ring-orange-500
                  active:scale-95
                "
              >
                Exit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checklist;