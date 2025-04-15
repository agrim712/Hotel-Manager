import React from "react";
import { Link } from "react-router-dom";
import Contact from "./Contact";

const Home = () => {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">The simplest and most comprehensive Hotel Management System</h1>
      <p>Asyncotel is a fully integrated cloud-based Hotel Management System & ERP that can increase your hospitality business & reduce costs & inefficiency.</p>

      <p className="mt-4">What makes Aiosell unique & different?</p>
      <ul className="list-disc pl-5 mt-2">
        <li>Extremely easy to use</li>
        <li>Low cost & Value for Money</li>
        <li>All In One System with all Modules</li>
        <li>Developed by hotel owners</li>
        <li>Best in class Dynamic Pricing & RMS system</li>
      </ul>

      {/* Start Now Button */}
      <div className="mt-6 text-center">
        <Link to="/onboard">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition">
            Start Now
          </button>
        </Link>
      </div>

      {/* Feature Navigation */}
      <div className="mt-10">
        <h2 className="text-xl font-bold text-center mb-4">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/pms" className="block bg-blue-500 text-white p-4 rounded-md text-center hover:bg-blue-600 transition">
            Property Management System (PMS)
          </Link>
          <Link to="/channel-manager" className="block bg-green-500 text-white p-4 rounded-md text-center hover:bg-green-600 transition">
            Channel Manager
          </Link>
          <Link to="/rms" className="block bg-yellow-500 text-white p-4 rounded-md text-center hover:bg-yellow-600 transition">
            Revenue Management System (with Dynamic Pricing)
          </Link>
          <Link to="/booking-engine" className="block bg-purple-500 text-white p-4 rounded-md text-center hover:bg-purple-600 transition">
            Booking Engine & Website (with Google integration)
          </Link>
        </div>
      </div>

      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default Home;