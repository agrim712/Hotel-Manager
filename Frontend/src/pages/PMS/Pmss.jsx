import React, { useState, useEffect } from "react";
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
import { useProductContext } from "../../context/ProductAccessContext";

const Pmss = () => {
  const navigate = useNavigate();
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const { products } = useProductContext();

  const normalizedProducts = products.map((p) => p.toLowerCase());
  const has = (label) => normalizedProducts.includes(label.toLowerCase());

  useEffect(() => {
    // Auto open POS section if any POS-related product is enabled
    if (
      has("Bar & Beverage Management") ||
      has("Spa & Wellness Management") ||
      has("Restaurant & Dining Management")
    ) {
      setIsPOSOpen(true);
    }
  }, [products]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col overflow-y-auto">
        <div className="text-xl font-bold p-4 border-b border-gray-700 flex items-center justify-between">
          <span>⬤ PMS</span>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          {has("PMS") && (
            <>
              <SidebarButton icon={<FaChartBar />} label="Dashboard" onClick={() => navigate("/pmss/dashboard")} />
              <SidebarButton icon={<FaBed />} label="Stay View" onClick={() => navigate("/pmss/stay-view")} />
              <SidebarButton icon={<FaCalendarAlt />} label="Rooms View" onClick={() => navigate("/pmss/rooms-view")} />
              <SidebarButton icon={<FaPlus />} label="Reservation" onClick={() => navigate("/pmss/reservation")} />
              <SidebarButton icon={<FaUsers />} label="Guests" onClick={() => navigate("/pmss/guests")} />
              <SidebarButton icon={<FaBuilding />} label="Companies" onClick={() => navigate("/pmss/companies")} />
              <SidebarButton icon={<FaFileAlt />} label="Reports" onClick={() => navigate("/pmss/reports")} />
            </>
          )}

          {(has("Bar & Beverage Management") || has("Spa & Wellness Management") || has("Restaurant & Dining Management")) && (
            <div>
              <button
                onClick={() => setIsPOSOpen(!isPOSOpen)}
                className="flex items-center gap-3 hover:text-blue-300 w-full text-left"
              >
                <FaUtensils /> POS
                <span className="ml-auto">{isPOSOpen ? "▾" : "▸"}</span>
              </button>

              {isPOSOpen && (
                <div className="ml-6 mt-2 space-y-2">
                  {has("Bar & Beverage Management") && (
                    <SidebarSubButton icon={<FaCocktail />} label="Bar Management" onClick={() => navigate("/pmss/bar-management")} />
                  )}
                  {has("Spa & Wellness Management") && (
                    <SidebarSubButton icon={<FaSpa />} label="Spa Management" onClick={() => navigate("/pmss/spa-management")} />
                  )}
                  {has("Restaurant & Dining Management") && (
                    <SidebarSubButton icon={<FaUtensils />} label="Restaurant Management" onClick={() => navigate("/pmss/restaurant-management")} />
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

const SidebarButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 hover:text-blue-300 w-full text-left transition duration-150"
  >
    {icon} {label}
  </button>
);

const SidebarSubButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 text-sm hover:text-blue-300 w-full text-left transition duration-150"
  >
    {icon} {label}
  </button>
);

export default Pmss;
