import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomTypeSelect = ({ formData, handleChange, errors }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setFetchError("User not authenticated.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/hotel/room-types", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Room types response data:", res.data);

        if (Array.isArray(res.data)) {
          setRoomTypes(res.data);
          setFetchError(null);
        } else {
          setFetchError("Invalid room types format from server.");
          setRoomTypes([]);
        }
      } catch (error) {
        console.error("Error fetching room types:", error);
        setFetchError("Failed to load room types.");
        setRoomTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, []);

  return (
    <div className="mb-4">
      <label htmlFor="roomType" className="block font-medium">
        Room Type
      </label>

      {loading ? (
        <p>Loading room types...</p>
      ) : fetchError ? (
        <p className="text-red-500 text-sm">{fetchError}</p>
      ) : (
        <>
          <select
            id="roomType"
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            className={`w-full border p-2 rounded ${
              errors.roomType ? "border-red-500" : ""
            }`}
            required
          >
            <option value="">Select Room Type</option>
            {roomTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          {errors.roomType && (
            <p className="text-red-500 text-sm mt-1">{errors.roomType}</p>
          )}
        </>
      )}
    </div>
  );
};

export default RoomTypeSelect;
