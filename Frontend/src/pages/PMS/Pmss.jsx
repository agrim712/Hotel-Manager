import React from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  FaChartBar,
  FaBed,
  FaCalendarAlt,
  FaPlus,
  FaUsers,
  FaBuilding,
  FaFileAlt,
  FaCocktail,
  FaSpa,
  FaUtensils,
} from "react-icons/fa";

const Pmss = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-xl font-bold p-4 border-b border-gray-700 flex items-center justify-between">
          <span>⬤ PMS</span>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          <button
            onClick={() => navigate("/pmss/dashboard")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaChartBar /> Dashboard
          </button>
          <button
            onClick={() => navigate("/pmss/stay-view")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaBed /> Stay View
          </button>
          <button
            onClick={() => navigate("/pmss/rooms-view")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaCalendarAlt /> Rooms View
          </button>
          <button
            onClick={() => navigate("/pmss/reservation")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaPlus /> Reservation
          </button>
          <button
            onClick={() => navigate("/pmss/guests")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaUsers /> Guests
          </button>
          <button
            onClick={() => navigate("/pmss/companies")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaBuilding /> Companies
          </button>
          <button
            onClick={() => navigate("/pmss/reports")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaFileAlt /> Reports
          </button>

          {/* New Sections */}
          <button
            onClick={() => navigate("/pmss/bar-management")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaCocktail /> Bar Management
          </button>
          <button
            onClick={() => navigate("/pmss/spa-management")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaSpa /> Spa Management
          </button>
          <button
            onClick={() => navigate("/pmss/restaurant-management")}
            className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
          >
            <FaUtensils /> Restaurant Management
          </button>
        </nav>
      </aside>

      {/* Content Area */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Pmss;
