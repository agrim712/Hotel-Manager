import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const navVariants = {
  initial: { y: -80, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
};

const linkHoverEffect = "hover:text-yellow-300 hover:scale-105 transition-all duration-300";

const Navbar = ({ isLoggedIn, hotelName, onLogout }) => {
  return (
    <motion.nav
      variants={navVariants}
      initial="initial"
      animate="animate"
      className="z-50 flex justify-between items-center bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 w-full h-20 px-10 text-white shadow-xl sticky top-0"
    >
      {/* Brand Logo */}
      <Link
        to="/"
        className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-transparent bg-clip-text animate-pulse"
      >
        Asyncotel
      </Link>

      {/* Links for logged-in user */}
      {isLoggedIn ? (
        <div className="flex items-center space-x-6">
          <motion.span
            className="bg-black/30 px-5 py-2 rounded-full text-sm font-semibold backdrop-blur-sm"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {hotelName}
          </motion.span>
          <button
            onClick={onLogout}
            className="bg-white text-red-600 px-5 py-2 rounded-full font-semibold hover:bg-red-100 shadow-lg transition-all duration-300"
          >
            Logout
          </button>
        </div>
      ) : (
        // Public Links
        <div className="flex items-center gap-6">
          {[
            { name: "HOME", to: "/" },
            { name: "NEWS", to: "/news" },
            { name: "OUR PRODUCTS", to: "/products" },
            { name: "BLOG", to: "/blog" },
            { name: "PRICING", to: "/pricing" },
            { name: "CONTACT US", to: "/contact" },
          ].map((link, index) => (
            <motion.div
              key={link.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-sm font-medium"
            >
              <Link to={link.to} className={linkHoverEffect}>
                {link.name}
              </Link>
            </motion.div>
          ))}

          {/* Animated Login Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/login"
              className="bg-white text-red-600 px-5 py-2 rounded-full font-semibold shadow-md hover:bg-yellow-100 transition-all duration-300"
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
