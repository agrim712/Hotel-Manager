import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHotel, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const OnboardedHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/superadmin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHotels(res.data.data);
      } catch (err) {
        setError("Failed to fetch hotels");
      } finally {
        setLoading(false);
      }
    };
    fetchHotels();
  }, []);

  if (loading)
    return <div className="text-center text-lg font-semibold p-10">Loading...</div>;
  if (error)
    return <div className="text-center text-red-600 text-lg p-10">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-white py-10 px-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-10">Onboarded Hotels</h1>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
        {hotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-gradient-to-br from-blue-200 via-white to-blue-100 p-6 rounded-2xl shadow-xl border border-blue-300 hover:shadow-2xl transition duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <FaHotel size={30} className="text-blue-700" />
              <h2 className="text-2xl font-bold text-blue-800">{hotel.name}</h2>
            </div>
            <p className="text-gray-700 flex items-center gap-2 mb-2">
              <FaMapMarkerAlt /> {hotel.address}, {hotel.city}, {hotel.country}
            </p>
            <p className="text-gray-700 flex items-center gap-2 mb-2">
              <FaPhone /> +{hotel.phoneCode} {hotel.phoneNumber}
            </p>
            {hotel.email && (
              <p className="text-gray-700 flex items-center gap-2 mb-2">
                <FaEnvelope /> {hotel.email}
              </p>
            )}
            <p className="text-sm text-gray-600 italic">
              Rooms: {hotel.totalRooms} | Type: {hotel.propertyType || "N/A"} |
              Payment: {hotel.isPaymentDone ? "✅ Done" : "❌ Pending"}
            </p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <FaCalendarAlt /> Onboarded on {new Date(hotel.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardedHotels;
