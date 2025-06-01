import React, { useEffect, useState } from "react";
import axios from "axios";

const NumberOfRoomsDropdown = ({ roomType, rateType, token, onSelect }) => {
  const [roomCount, setRoomCount] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState("");

  useEffect(() => {
    console.log("🏨 roomType:", roomType);
    console.log("💰 rateType:", rateType);
    console.log("🔑 token:", token);

    const fetchRoomCount = async () => {
      if (!roomType || !rateType) {
        console.warn("❗ Missing roomType or rateType. Skipping API call.");
        return;
      }

      try {
        const url = `http://localhost:5000/api/hotel/count?roomType=${roomType}&rateType=${rateType}`;
        console.log("🌐 Fetching room count from:", url);

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("✅ Room count API response:", response.data);

        if (response.data && typeof response.data.numOfRooms === "number") {
          setRoomCount(response.data.numOfRooms);
        } else {
          console.warn("⚠️ Unexpected response format:", response.data);
          setRoomCount(0);
        }
      } catch (error) {
        console.error("🚨 Error fetching room count:", error);
        setRoomCount(0);
      }
    };

    fetchRoomCount();
  }, [roomType, rateType, token]);

  const handleChange = (e) => {
    const value = e.target.value;
    console.log("🟦 User selected number of rooms:", value);
    setSelectedRooms(value);
    if (onSelect) {
      onSelect(value);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Number of Rooms
      </label>
      <select
        value={selectedRooms}
        onChange={handleChange}
        className="border border-gray-300 rounded px-3 py-2 w-full"
        disabled={roomCount === 0}
      >
        <option value="">
          {roomCount === 0 ? "No rooms available" : "Select number of rooms"}
        </option>
        {Array.from({ length: roomCount }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NumberOfRoomsDropdown;
