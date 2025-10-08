import { Bell, Search, CircleUser, LogOut } from "lucide-react";
import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-[60px] bg-[#e5e5e5] flex justify-between items-center px-4 sm:px-6 md:px-8 border-b border-gray-300 
                    ml-0 md:ml-60">
      {/* Search box */}
      <div className="flex items-center bg-white px-2 sm:px-3 py-1.5 rounded-lg border border-gray-400 
                      w-[150px] sm:w-[180px] md:w-[220px]">
        <Search className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search"
          className="border-none outline-none text-sm sm:text-base w-full"
        />
      </div>

      {/* Profile section */}
      <div className="flex items-center gap-3 sm:gap-5">
        <Bell className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
        <CircleUser className="text-gray-700 w-5 h-5 sm:w-6 sm:h-6" />
        <div className="flex items-center gap-2">
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#ff6600] to-[#cc3300] 
                             text-white rounded-2xl font-bold cursor-pointer text-sm sm:text-base">
            <span className="text-[12px] font-medium">{user?.fullName || "User"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-700 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;