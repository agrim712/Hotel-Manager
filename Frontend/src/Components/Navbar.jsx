import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaHotel, FaUserCircle, FaUsersCog, FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { saveAs } from "file-saver";

const navVariants = {
  initial: { y: -80, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const Navbar = () => {
  const { isLoggedIn, userRole, hotel, logout, setHotel } = useAuth();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [upgrades, setUpgrades] = useState([]);

  const showOnlyLogout =
    location.pathname === "/superadmin-dashboard" ||
    location.pathname === "/hoteladmin-dashboard";

useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token || !isLoggedIn) return;

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
  
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
  };

  const handleCreateRoleLogin = async () => {
    const token = localStorage.getItem("token");

    if (!selectedRole || !newUser.name || !newUser.email || !newUser.password) {
      alert("Please fill all fields and select a role.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/hotel/create-role-user",
        {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: selectedRole,
          hotelId: hotel?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("User created successfully!");
      
      setNewUser({ name: "", email: "", password: "" });
      setShowRolesPanel(false);
    } catch (err) {
      console.error("Create role login error:", err);
      alert("Failed to create login.");
    }
  };

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

      {userRole === "HOTELADMIN" && (
        <div className="relative">
          {/* Enhanced Roles Button with clear label */}
          <button
            onClick={() => setShowRolesPanel((prev) => !prev)}
            className="flex items-center space-x-2 bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-all shadow-md"
          >
            <FaUsersCog className="text-lg" />
            <span>Manage Staff Roles</span>
            <motion.span
              animate={{ rotate: showRolesPanel ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaPlus className="text-sm" />
            </motion.span>
          </button>

          {/* Roles Panel */}
          <AnimatePresence>
            {showRolesPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-14 right-0 w-96 p-5 bg-white text-black rounded-xl shadow-2xl z-50 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Create New Staff Account</h3>
                  <button 
                    onClick={() => setShowRolesPanel(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Staff Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={handleRoleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a role...</option>
                      <option value="Front Office">Front Office</option>
                      <option value="Housekeeping">Housekeeping</option>
                      <option value="Engineering & Maintenance">Engineering & Maintenance</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Accounts & Finance">Accounts & Finance</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="staff@hotel.com"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="Create a password"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    />
                  </div>

                  <button
                    onClick={handleCreateRoleLogin}
                    disabled={!selectedRole || !newUser.name || !newUser.email || !newUser.password}
                    className={`w-full px-4 py-3 rounded-lg text-white font-semibold transition-all ${
                      !selectedRole || !newUser.name || !newUser.email || !newUser.password
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-md"
                    }`}
                  >
                    Create {selectedRole || "Staff"} Account
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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