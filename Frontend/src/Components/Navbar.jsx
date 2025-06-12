import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, hotelName, onLogout }) => {
  return (
    <nav className="flex justify-between items-center bg-gradient-to-r from-red-600 to-red-500 w-full h-16 px-10 text-white shadow-lg">
      <Link className="text-2xl font-bold hover:text-red-200 transition-colors" to="/">
        Asyncotel
      </Link>
      
      {isLoggedIn ? (
        <div className="flex items-center space-x-6">
          <span className="font-medium text-red-100 bg-red-700 px-4 py-1 rounded-full">
            {hotelName}
          </span>
          <button
            onClick={onLogout}
            className="bg-white text-red-600 px-4 py-1 rounded-full font-medium hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex space-x-8 items-center">
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/"
          >
            HOME
          </Link>
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/news"
          >
            NEWS
          </Link>
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/products"
          >
            OUR PRODUCTS
          </Link>
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/blog"
          >
            BLOG
          </Link>
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/pricing"
          >
            PRICING
          </Link>
          <Link 
            className="hover:text-red-200 font-medium transition-colors" 
            to="/contact"
          >
            CONTACT US
          </Link>
          <Link 
            className="bg-white text-red-600 px-4 py-1 rounded-full font-medium hover:bg-red-100 transition-colors" 
            to="/login"
          >
            LOGIN
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;