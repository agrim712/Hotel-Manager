import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useProductContext } from "../context/ProductAccessContext";
import {
  FaUserCircle,
  FaCog,
  FaConciergeBell,
  FaMoneyBillWave,
  FaQuestionCircle,
  FaChevronDown,
  FaHotel,
} from "react-icons/fa";

const navVariants = {
  initial: { y: -80, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const dropdownVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } },
};

const allProducts = [
  "PMS",
  "Bar & Beverage Management",
  "Spa & Wellness Management",
  "Restaurant & Dining Management",
];

const Navbar = ({ isLoggedIn, hotelName, onLogout }) => {
  const location = useLocation();
  const { products } = useProductContext();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn || false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const normalizedProducts = products.map((p) => p.toLowerCase());

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    setLoggedIn(isLoggedIn || false);
  }, [isLoggedIn]);

  const unpurchasedProducts = allProducts.filter(
    (p) => !normalizedProducts.includes(p.toLowerCase())
  );

  const displayHotelName =
    hotelName?.charAt(0).toUpperCase() + hotelName?.slice(1) || "Hotel Profile";

  const managementFeatures = [
    { name: "Revenue", icon: FaMoneyBillWave, to: "/revenue" },
    { name: "Services", icon: FaConciergeBell, to: "/services" },
  ];

  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="z-50 flex justify-between items-center bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 w-full h-20 px-6 md:px-10 text-white shadow-2xl sticky top-0 border-b border-white/10"
    >
      {/* Brand */}
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

      {loggedIn ? (
        <div className="flex items-center space-x-4 relative">
          {/* Profile Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => setShowProfileDropdown(false)}
          >
            <button className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full font-medium gap-2 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-lg border border-white/20">
              <FaUserCircle className="text-lg" />
              <span className="hidden md:inline">{displayHotelName}</span>
              <FaChevronDown
                className={`text-xs transition-transform duration-200 ${
                  showProfileDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-0 mt-2 bg-white text-gray-800 shadow-2xl rounded-xl p-4 min-w-[260px] z-50 border border-gray-200"
                >
                  <div className="border-b border-gray-200 pb-3 mb-3">
                    <p className="font-bold text-lg text-gray-900">{displayHotelName}</p>
                    <p className="text-sm text-gray-600">Channel Manager Dashboard</p>
                  </div>

                  <div className="space-y-2">
                    {managementFeatures.map((feature) => (
                      <Link
                        key={feature.name}
                        to={feature.to}
                        className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                      >
                        <feature.icon className="text-blue-600" />
                        <span className="font-medium group-hover:text-blue-600">{feature.name}</span>
                      </Link>
                    ))}

                    <hr className="my-2" />

                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <FaCog className="text-gray-600" />
                      <span className="font-medium group-hover:text-gray-800">Settings</span>
                    </Link>

                    <Link
                      to="/help"
                      className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <FaQuestionCircle className="text-gray-600" />
                      <span className="font-medium group-hover:text-gray-800">Help & Support</span>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
             {/* Create Reservation Button */}
<Link
  to="/pmss/reservation/create/regular"
  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg border border-white/20"
>
  + Create Reservation
</Link>

          {/* Upgrade Features */}
          <div
            className="relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-lg border border-white/20">
              Upgrade Features
            </button>

            <AnimatePresence>
              {showDropdown && unpurchasedProducts.length > 0 && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-0 mt-2 bg-white text-gray-800 shadow-2xl rounded-xl p-4 min-w-[260px] z-50 border border-gray-200"
                >
                  <p className="font-bold mb-3 text-gray-900">Available Upgrades:</p>
                  <ul className="space-y-2">
                    {unpurchasedProducts.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <span className="text-gray-700 font-medium">{feature}</span>
                        <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold hover:from-green-600 hover:to-green-700 transition-all">
                          Add
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Link
                      to="/pricing"
                      className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                      View All Plans
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full font-semibold hover:from-red-600 hover:to-red-700 shadow-lg transition-all duration-300 border border-white/20"
          >
            Logout
          </motion.button>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {[{ name: "HOME", to: "/" },
            { name: "NEWS", to: "/news" },
            { name: "PRODUCTS", to: "/products" },
            { name: "BLOG", to: "/blog" },
            { name: "PRICING", to: "/pricing" },
            { name: "CONTACT", to: "/contact" },
          ].map((link) => (
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
