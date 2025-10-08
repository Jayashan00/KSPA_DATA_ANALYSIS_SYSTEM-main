import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/header";
import Slidebar from "../../components/slidebar";

const Location = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const sections = [
    "OCC",
    "Mill Morters",
    "ETP",
    "Mill 3rd Floor",
    "Mill Ground Floor",
    "Daily Routine"

  ];

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ">
            {sections.map((section, index) => (
              <button
                key={index}
                className="w-full h-32 bg-[rgb(237,230,226)] text-black font-semibold rounded-lg
                           hover:bg-white transition-colors flex items-center justify-center border-3 shadow-2xl border-orange-500"
                onClick={() => {
                  // if (index + 1 === 2) {
                  //   navigate("/location2"); // 👈 Special page for Location 2
                  // } else {
                  //   navigate(`/location/${index + 1}`);
                  // }
                  navigate(`/e_location/e_location${index+1}`);
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
