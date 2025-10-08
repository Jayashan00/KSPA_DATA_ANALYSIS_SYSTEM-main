import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/header";
import Slidebar from "../components/slidebar";

const Location = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Read shift from query param
  const queryParams = new URLSearchParams(location.search);
  const shift = queryParams.get("shift") || "Day"; // fallback Day if not given

  const sections = [
    "Mill 1st floor",
    "OCC ground floor",
    "OCC 1st floor",
    "Mill ground floor",
    "Starch cooking room",
    "Heat Recovery & Turbine Fan",
  ];

  // ✅ Helper to navigate with shift preserved
  const goToLocation = (path) => {
    navigate(`${path}?shift=${shift}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Slidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header />

        {/* Page Content */}
        <div className="p-10 mt-12 ml-[250px]">
          {/* 3x3 Location Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {sections.map((section, index) => (
              <button
                key={index}
                className="w-full h-32 bg-[rgb(237,230,226)] text-black font-semibold rounded-lg
                           hover:bg-white transition-colors flex items-center justify-center border-3 shadow-2xl border-orange-500"
                onClick={() => {
                  if (index + 1 === 1) goToLocation("/location1");
                  else if (index + 1 === 2) goToLocation("/location2");
                  else if (index + 1 === 3) goToLocation("/location3");
                  else if (index + 1 === 4) goToLocation("/location4");
                  else if (index + 1 === 5) goToLocation("/location5");
                  else if (index + 1 === 6) goToLocation("/location6");
                  else goToLocation(`/location/${index + 1}`);
                }}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
