import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHotel, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { saveAs } from "file-saver";

const navVariants = {
  initial: { y: -80, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const Navbar = () => {
  const { isLoggedIn, userRole, hotel, logout, setHotel } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [upgrades, setUpgrades] = useState([]);

  const showOnlyLogout =
    location.pathname === "/superadmin-dashboard" ||
    location.pathname === "/hoteladmin-dashboard";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || !isLoggedIn) return;

    if (!hotel) {
      axios
        .get("/api/hotel/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setHotel(res.data.hotel);
        })
        .catch((err) => {
          console.error("Failed to fetch hotel info", err);
        });
    }

    axios
      .get("http://localhost:5000/api/hotel/available-upgrades", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUpgrades(res.data.upgrades || []);
      })
      .catch((err) => {
        console.error("Error fetching upgrades", err);
      });
  }, [isLoggedIn, location.pathname]);

  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handlePolicyDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/hotel/hotel-policy", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const hotelName = hotel?.name?.replace(/\s+/g, "_") || "HotelPolicy";
      saveAs(blob, `HotelPolicy-${hotelName}.pdf`);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download hotel policy.");
    }
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="z-50 flex justify-between items-center bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 w-full h-20 px-6 md:px-10 text-white shadow-2xl sticky top-0 border-b border-white/10"
    >
      <Link to="/" className="flex items-center space-x-2 group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
          <FaHotel className="relative text-3xl text-cyan-400 group-hover:text-cyan-300 transition-colors" />
        </div>
        <span className="text-3xl md:text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
            Async
          </span>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            otel
          </span>
        </span>
      </Link>

      {isLoggedIn ? (
        showOnlyLogout ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-semibold hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 border border-white/20"
          >
            Logout
          </motion.button>
        ) : (
          <div className="flex items-center gap-4 relative">
            {upgrades.length > 0 && (
              <div className="relative group">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg border border-white/20 cursor-pointer">
                  Available Upgrades
                </div>
                <div className="absolute right-0 mt-2 hidden group-hover:block bg-white text-black rounded-lg shadow-lg border border-gray-200 z-50 w-64 max-h-48 overflow-y-auto">
                  {upgrades.map((module) => (
  <div
    key={module.value}
    className="flex justify-between items-center text-sm text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md m-1"
  >
    <span>{module.label}</span>
    <button
      className="text-xs text-green-600 hover:underline"
      onClick={() => alert(`Buy ${module.label} clicked`)}
    >
      Buy →
    </button>
  </div>
))}

                </div>
              </div>
            )}

            <div className="relative">
              <button onClick={toggleDropdown} className="focus:outline-none">
                <FaUserCircle className="text-3xl hover:text-cyan-300 transition" />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-72 bg-white text-black rounded-lg shadow-lg border border-gray-200 z-50"
                  >
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-lg">
                        {hotel ? hotel.name || "Unnamed Hotel" : "Loading..."}
                      </p>
                      {hotel?.contactPerson && (
                        <p className="text-sm text-gray-600">
                          <strong>Contact:</strong> {hotel.contactPerson}
                        </p>
                      )}
                      {hotel?.email && (
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {hotel.email}
                        </p>
                      )}
                      {(hotel?.city || hotel?.country) && (
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {hotel.city || ""}
                          {hotel.city && hotel.country ? ", " : ""}
                          {hotel.country || ""}
                        </p>
                      )}
                      {hotel?.products && Array.isArray(hotel.products) && (
                        <>
                          <p className="mt-2 font-semibold text-gray-700">Products:</p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {[
                              "Property Management System (PMS)",
                              "Spa Management",
                              "Revenue Management System (RMS)",
                              "Bar Management",
                              "Restaurant Management",
                              "Laundry Management",
                              "Cab/Travel Management"
                            ].map((feature) => (
                              <li
                                key={feature}
                                className={
                                  hotel.products.some((p) => p.label === feature)
                                    ? "text-green-600"
                                    : "text-gray-400 line-through"
                                }
                              >
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handlePolicyDownload}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t border-gray-200"
                    >
                      📄 Download Hotel Policies
                    </button>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium border-t border-gray-200"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )
      ) : (
        <div className="flex items-center gap-6">
          {[{ name: "HOME", to: "/" }, { name: "CONTACT", to: "/contact" }].map((link) => (
            <motion.div key={link.name} whileHover={{ scale: 1.05 }}>
              <Link
                to={link.to}
                className="relative group font-medium transition-all duration-300 hover:text-cyan-300"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </motion.div>
          ))}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 border border-white/20"
            >
              LOGIN
            </Link>
          </motion.div>
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;
