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
  FaMoneyBillWave,
  FaUtensils,
  FaChartLine,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useProductContext } from "../../context/ProductAccessContext";

const Spinner = () => (
  <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Pmss = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const { products, loading: productsLoading } = useProductContext();
  const { hotel, userRole, loading: authLoading } = useAuth();
  // Only show loading while data is actually being fetched, not while values are null/undefined
  const isLoading = authLoading || productsLoading;

  useEffect(() => {
    // Minimal debug logs; remove if noisy
    if (authLoading || productsLoading) {
      console.log("🔄 Loading State:", { authLoading, productsLoading });
    }
  }, [authLoading, productsLoading]);

  if (isLoading) {
    return <Spinner />;
  }

  const hasProduct = (productName) => {
    return products?.some((p) => p?.name === productName);
  };

  const isActive = (path) => location.pathname.includes(path);

  const isFullAccess = userRole === "HOTELADMIN" || userRole === "SUPERADMIN";

  const allowedStaffRoles = [
    "Front Office",
    "Housekeeping",
    "Engineering & Maintenance",
    "Sales & Marketing",
    "Accounts & Finance",
    "Security",
  ];

  const isStaff = userRole && allowedStaffRoles.includes(userRole);

  useEffect(() => {
    // Check for POS products using the exact names from productOptions
    const posEnabled = hasProduct("POS Suite") || hasProduct("All-in-One PMS");
    setIsPOSOpen(posEnabled);
  }, [products]);

  useEffect(() => {
    if (location.pathname === "/pmss" || location.pathname === "/pmss/") {
      navigate("/pmss/stay-view", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <aside className="w-64 bg-[#1e293b] text-white flex flex-col shadow-md overflow-y-auto">
        <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
          {isFullAccess && (
            <>
              {/* 🧾 General Access Tabs */}
              <SidebarButton
                icon={<FaChartBar />}
                label="Dashboard"
                onClick={() => navigate("/pmss")}
                active={
                  isActive("/pmss") &&
                  !isActive("reservation") &&
                  !isActive("stay-view")
                }
              />
              <SidebarButton
                icon={<FaBed />}
                label="Stay View"
                onClick={() => navigate("/pmss/stay-view")}
                active={isActive("stay-view")}
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

              {/* 🧹 Housekeeping - Available in Pro PMS and above */}
              {(hasProduct("Pro PMS") ||
                hasProduct("Enterprise PMS") ||
                hasProduct("All-in-One PMS")) && (
                <>
                  <SidebarButton
                    icon={<FaCalendarAlt />}
                    label="Rooms View"
                    onClick={() => navigate("/pmss/rooms-view")}
                    active={isActive("rooms-view")}
                  />
                  <SidebarButton
                    icon={<FaFileAlt />}
                    label="Housekeeping"
                    onClick={() => navigate("/pmss/housekeeping")}
                    active={isActive("housekeeping")}
                  />
                </>
              )}

              {/* 💰 Accounts & Finance - Available in Pro PMS and above */}
              {(hasProduct("Pro PMS") ||
                hasProduct("Enterprise PMS") ||
                hasProduct("All-in-One PMS")) && (
                <>
                  <SidebarButton
                    icon={<FaFileAlt />}
                    label="Reports"
                    onClick={() => navigate("/pmss/reports")}
                    active={isActive("reports")}
                  />
                  <SidebarButton
                    icon={<FaMoneyBillWave />}
                    label="Expenses"
                    onClick={() => navigate("/pmss/expenses")}
                    active={isActive("expenses")}
                  />
                </>
              )}

              {/* 🛠 Engineering - Available in Enterprise PMS */}
              {(hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaBuilding />}
                  label="Operations"
                  onClick={() => navigate("/pmss/operations")}
                  active={isActive("operations")}
                />
              )}

              {/* 📈 Sales - Available in Enterprise PMS */}
              {(hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaChartLine />}
                  label="Sales Management"
                  onClick={() => navigate("/pmss/sales")}
                  active={isActive("sales")}
                />
              )}

              {/* 🛡 Security - Available in Enterprise PMS */}
              {(hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaBuilding />}
                  label="Security"
                  onClick={() => navigate("/pmss/security")}
                  active={isActive("security")}
                />
              )}

              {/* 🧠 Revenue - Available in Revenue Suite or Enterprise PMS */}
              {(hasProduct("Revenue Suite") ||
                hasProduct("Enterprise PMS") ||
                hasProduct("All-in-One PMS")) && (
                <>
                  <SidebarButton
                    icon={<FaChartLine />}
                    label="Revenue Manager"
                    onClick={() => navigate("/pmss/revenue-manager")}
                    active={isActive("revenue-manager")}
                  />
                  <SidebarButton
                    icon={<FaMoneyBillWave />}
                    label="Rate Management"
                    onClick={() => navigate("/pmss/rate-management")}
                    active={isActive("rate-management")}
                  />
                </>
              )}

              {/* 👥 HR - Available in Enterprise PMS */}
              {(hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaUsers />}
                  label="HR Module"
                  onClick={() => navigate("/pmss/hr")}
                  active={isActive("hr")}
                />
              )}

              {/* 💼 Accounting - Available in Enterprise PMS */}
              {(hasProduct("Enterprise PMS") || hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaChartLine />}
                  label="Accounting & Finance"
                  onClick={() => navigate("/pmss/accounting")}
                  active={isActive("accounting")}
                />
              )}

              {/* 🌐 Booking Engine - Available in Booking Engine Suite */}
              {(hasProduct("Booking Engine Suite") ||
                hasProduct("All-in-One PMS")) && (
                <SidebarButton
                  icon={<FaCalendarAlt />}
                  label="Booking Engine"
                  onClick={() =>
                    navigate(`/booking-engine/${hotel?.id || ""}`)
                  }
                  active={isActive("booking-engine")}
                />
              )}
            </>
          )}

          {/* Staff Access */}
          {isStaff && userRole === "Front Office" && (
            <>
              <SidebarButton
                icon={<FaPlus />}
                label="Reservation"
                onClick={() => navigate("/pmss/reservation")}
                active={isActive("reservation")}
              />
              <SidebarButton
                icon={<FaBed />}
                label="Stay View"
                onClick={() => navigate("/pmss/stay-view")}
                active={isActive("stay-view")}
              />
              <SidebarButton
                icon={<FaUsers />}
                label="Guests"
                onClick={() => navigate("/pmss/guests")}
                active={isActive("guests")}
              />
            </>
          )}

          {isStaff && userRole === "Housekeeping" && (
            <>
              <SidebarButton
                icon={<FaCalendarAlt />}
                label="Rooms View"
                onClick={() => navigate("/pmss/rooms-view")}
                active={isActive("rooms-view")}
              />
              <SidebarButton
                icon={<FaFileAlt />}
                label="Housekeeping"
                onClick={() => navigate("/pmss/housekeeping")}
                active={isActive("housekeeping")}
              />
            </>
          )}

          {isStaff && userRole === "Engineering & Maintenance" && (
            <SidebarButton
              icon={<FaBuilding />}
              label="Operations"
              onClick={() => navigate("/pmss/operations")}
              active={isActive("operations")}
            />
          )}

          {isStaff && userRole === "Sales & Marketing" && (
            <SidebarButton
              icon={<FaChartLine />}
              label="Sales Management"
              onClick={() => navigate("/pmss/sales")}
              active={isActive("sales")}
            />
          )}

          {isStaff && userRole === "Security" && (
            <SidebarButton
              icon={<FaBuilding />}
              label="Security"
              onClick={() => navigate("/pmss/security")}
              active={isActive("security")}
            />
          )}

          {/* POS Modules */}
          {(hasProduct("POS Suite") || hasProduct("All-in-One PMS")) && (
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
                  <SidebarSubButton
                    icon={<FaCocktail />}
                    label="Bar Management"
                    onClick={() => navigate("/pmss/bar-management")}
                    active={isActive("bar-management")}
                  />
                  <SidebarSubButton
                    icon={<FaSpa />}
                    label="Spa Management"
                    onClick={() => navigate("/pmss/spa-management")}
                    active={isActive("spa-management")}
                  />
                  <SidebarSubButton
                    icon={<FaUtensils />}
                    label="Restaurant Management"
                    onClick={() => navigate("/pos")}
                    active={isActive("restaurant-management")}
                  />
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>

      <main className="flex-1 bg-[#f8fafc] p-6 overflow-y-auto">
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
