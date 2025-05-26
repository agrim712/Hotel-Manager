import React from "react";
import { Link, Outlet } from "react-router-dom";
import {
  FaChartBar,
  FaBed,
  FaCalendarAlt,
  FaPlus,
  FaUsers,
  FaBuilding,
  FaFileAlt
} from "react-icons/fa";

const Pmss = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="text-xl font-bold p-4 border-b border-gray-700 flex items-center justify-between">
          <span>⬤ PMS</span>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          <Link to="dashboard" className="flex items-center gap-3 hover:text-blue-300">
            <FaChartBar /> Dashboard
          </Link>
          <Link to="stay-view" className="flex items-center gap-3 hover:text-blue-300">
            <FaBed /> Stay View
          </Link>
          <Link to="rooms-view" className="flex items-center gap-3 hover:text-blue-300">
            <FaCalendarAlt /> Rooms View
          </Link>
          <Link to="reservation" className="flex items-center gap-3 hover:text-blue-300">
            <FaPlus /> Reservation
          </Link>
          <Link to="guests" className="flex items-center gap-3 hover:text-blue-300">
            <FaUsers /> Guests
          </Link>
          <Link to="companies" className="flex items-center gap-3 hover:text-blue-300">
            <FaBuilding /> Companies
          </Link>
          <Link to="reports" className="flex items-center gap-3 hover:text-blue-300">
            <FaFileAlt /> Reports
          </Link>
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
