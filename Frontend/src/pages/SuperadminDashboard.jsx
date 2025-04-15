import React from "react";
import { Link } from "react-router-dom";

const SuperadminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-6">Superadmin Dashboard</h1>

        <Link
          to="/create-hotel-admin"
          className="inline-block px-6 py-3 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition"
        >
          Create Hotel Admin
        </Link>
      </div>
    </div>
  );
};

export default SuperadminDashboard;
