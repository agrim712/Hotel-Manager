import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const CreateHotelAdmin = () => {
  const [formData, setFormData] = useState({
    hotelName: "",
    hotelEmail: "",
    hotelPassword: "",
    hotelAddress: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.post(
        "http://localhost:5000/api/auth/hotel-admins",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(response.data.message);

      setFormData({
        hotelName: "",
        hotelEmail: "",
        hotelPassword: "",
        hotelAddress: ""
      });
    } catch (err) {
      console.error("Error creating hotel admin:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.error || err.message || "Failed to create hotel admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-pink-100 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-1">
          Create Hotel Admin
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Add a new hotel and admin account
        </p>

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Hotel Name</label>
          <input
            type="text"
            name="hotelName"
            value={formData.hotelName}
            onChange={handleChange}
            required
            placeholder="Grand Hotel"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Hotel Address</label>
          <input
            type="text"
            name="hotelAddress"
            value={formData.hotelAddress}
            onChange={handleChange}
            required
            placeholder="123 Main Street"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-semibold text-gray-700">Admin Email</label>
          <input
            type="email"
            name="hotelEmail"
            value={formData.hotelEmail}
            onChange={handleChange}
            required
            placeholder="admin@hotel.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Password</label>
          <input
            type="password"
            name="hotelPassword"
            value={formData.hotelPassword}
            onChange={handleChange}
            required
            minLength="6"
            placeholder="At least 6 characters"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white py-2 rounded-md font-semibold hover:from-sky-600 hover:to-blue-700 transition duration-200 ${
            isLoading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Create Hotel Admin"
          )}
        </button>

        <Link to="/superadmin-dashboard" className="block text-center mt-4 text-blue-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </form>
    </div>
  );
};

export default CreateHotelAdmin;
