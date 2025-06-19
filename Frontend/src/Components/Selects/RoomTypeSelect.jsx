import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomTypeSelect = ({ value, onChange, token }) => {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        if (!token) {
          setFetchError("User not authenticated.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/hotel/room-types", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          setRoomTypes(res.data);
          setFetchError(null);
        } else {
          setFetchError("Invalid room types format from server.");
          setRoomTypes([]);
        }
      } catch (error) {
        console.error("❌ Error fetching room types:", error);
        setFetchError("Failed to load room types.");
        setRoomTypes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoomTypes();
  }, [token]);

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
        <select
          id="roomType"
          name="roomType"
          value={value}
          onChange={(e) => {
            console.log("📤 RoomType selected:", e.target.value);
            onChange(e.target.value);
          }}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Room Type</option>
          {roomTypes.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default RoomTypeSelect;
