import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

const Sidebar = () => {
  const nav = useNavigate();
  const { isAdmin, isEngineer, isTechnician } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: "Dashboard", action: () => nav("/dashboard"), roles: ["all"] },
    { label: "Check List", action: () => nav("/checklist"), roles: ["all"] },
    { label: "Machine", action: () => nav("/machine"), roles: ["admin"] },
    { label: "Human", action: () => nav("/human"), roles: ["admin"] },
    { label: "History", action: () => nav("/history"), roles: ["engineer", "admin"] },
    { label: "Immediate Action", action: () => nav("/immediate_action"), roles: ["all"] },
    { label: "Maintenance", action: () => nav("/maintenance"), roles: ["all"] },
  ];

  const hasAccess = (roles) => {
    if (roles.includes("all")) return true;
    if (roles.includes("admin") && isAdmin()) return true;
    if (roles.includes("engineer") && isEngineer()) return true;
    if (roles.includes("technician") && isTechnician()) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-[#ff6600] rounded-lg text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen w-60 bg-gradient-to-b from-[#2e2e2e] to-[#1a1a1a] text-white p-8 flex flex-col items-start shadow-[4px_0_12px_rgba(0,0,0,0.4)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        {/* Brand */}
        <div className="flex items-center mb-12 w-full pl-2">
          <img src="/logo.png" alt="Logo" className="w-12 mr-2.5" />
          <span className="text-2xl font-semibold text-[#f2f2f2]">
            kspa <strong className="text-[#ff6600] font-bold">paper</strong>
          </span>
        </div>

        {/* Menu */}
        <div className="flex flex-col w-full">
          {menuItems.filter(item => hasAccess(item.roles)).map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.action();
                setIsOpen(false); // Close on mobile after click
              }}
              className="bg-gradient-to-r from-[#ff6600] to-[#cc3300] text-white text-sm font-semibold rounded-2xl py-5 px-5 mb-5 w-full text-center shadow-[0_4px_8px_rgba(255,102,0,0.2)] cursor-pointer transition-all duration-200 ease-in-out hover:from-[#cc3300] hover:to-[#ff5500] hover:-translate-y-0.5 hover:shadow-[0_8px_16px_rgba(255,102,0,0.3)]"
            >
              {item.label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;