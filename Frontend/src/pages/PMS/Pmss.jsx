import React, { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
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
import { useProductContext } from "../../context/ProductAccessContext";

const Pmss = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const { products } = useProductContext();

  const normalizedProducts = products.map((p) => p.toLowerCase());
  const has = (label) => normalizedProducts.includes(label.toLowerCase());
  const isActive = (path) => location.pathname.includes(path);

  useEffect(() => {
    if (
      has("Bar & Beverage Management") ||
      has("Spa & Wellness Management") ||
      has("Restaurant & Dining Management")
    ) {
      setIsPOSOpen(true);
    }
  }, [products]);

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shadow-md">
        <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
          {has("PMS") && (
            <>
              <SidebarButton
                icon={<FaChartBar />}
                label="Dashboard"
                onClick={() => navigate("/pmss/dashboard")}
                active={isActive("dashboard")}
              />
              <SidebarButton
                icon={<FaBed />}

                
                label="Stay View"
                onClick={() => navigate("/pmss/stay-view")}
                active={isActive("stay-view")}
              />
              <SidebarButton
                icon={<FaCalendarAlt />}
                label="Rooms View"
                onClick={() => navigate("/pmss/rooms-view")}
                active={isActive("rooms-view")}
              />
              <SidebarButton
                icon={<FaPlus />}
                label="Reservation"
                onClick={() => navigate("/pmss/reservation")}
                active={isActive("reservation")}
              />
              <SidebarButton
                icon={<FaUsers />}
                label="Guests"
                onClick={() => navigate("/pmss/guests")}
                active={isActive("guests")}
              />
              <SidebarButton
                icon={<FaBuilding />}
                label="Companies"
                onClick={() => navigate("/pmss/companies")}
                active={isActive("companies")}
              />
              <SidebarButton
                icon={<FaFileAlt />}
                label="Reports"
                onClick={() => navigate("/pmss/reports")}
                active={isActive("reports")}
              />
            </>
          )}

          {(has("Bar & Beverage Management") ||
            has("Spa & Wellness Management") ||
            has("Restaurant & Dining Management")) && (
            <div className="mt-4">
              <button
                onClick={() => setIsPOSOpen(!isPOSOpen)}
                className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-blue-800 transition"
              >
                <FaUtensils /> <span className="flex-1">POS</span>
                <span>{isPOSOpen ? "▾" : "▸"}</span>
              </button>

              {isPOSOpen && (
                <div className="ml-6 mt-2 space-y-1">
                  {has("Bar & Beverage Management") && (
                    <SidebarSubButton
                      icon={<FaCocktail />}
                      label="Bar Management"
                      onClick={() => navigate("/pmss/bar-management")}
                      active={isActive("bar-management")}
                    />
                  )}
                  {has("Spa & Wellness Management") && (
                    <SidebarSubButton
                      icon={<FaSpa />}
                      label="Spa Management"
                      onClick={() => navigate("/pmss/spa-management")}
                      active={isActive("spa-management")}
                    />
                  )}
                  {has("Restaurant & Dining Management") && (
                    <SidebarSubButton
                      icon={<FaUtensils />}
                      label="Restaurant Management"
                      onClick={() => navigate("/pmss/restaurant-management")}
                      active={isActive("restaurant-management")}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] p-6">
        <Outlet />
      </main>
    </div>
  );
};

const SidebarButton = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg transition-colors ${
      active
        ? "bg-blue-600 text-white font-semibold"
        : "hover:bg-slate-700 text-gray-200"
    }`}
  >
    {icon} {label}
  </button>
);

const SidebarSubButton = ({ icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 w-full text-sm px-3 py-1.5 rounded-md transition ${
      active
        ? "bg-blue-500 text-white font-medium"
        : "hover:bg-slate-700 text-gray-300"
    }`}
  >
    {icon} {label}
  </button>
);

export default Pmss;
