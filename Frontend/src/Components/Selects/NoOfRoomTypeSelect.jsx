import React, { useEffect, useState } from "react";
import axios from "axios";

const NumberOfRoomsDropdown = ({ roomType, rateType, token, onSelect }) => {
  const [roomCount, setRoomCount] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Reset dropdown value if roomType or rateType changes
  useEffect(() => {
    setSelectedRooms("");
  }, [roomType, rateType]);

  // Fetch available rooms
  useEffect(() => {
    const controller = new AbortController();

    const fetchRoomCount = async () => {
      if (!roomType || !rateType) {
        setRoomCount(0);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const API_BASE =
          import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || "http://localhost:5000";

        const url = `${API_BASE}/api/hotel/count?roomType=${roomType}&rateType=${rateType}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        if (response.data?.numOfRooms !== undefined) {
          setRoomCount(response.data.numOfRooms);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        if (!axios.isCancel(err)) {
          console.error("Error fetching room count:", err);
          setError("Failed to load room availability");
          setRoomCount(0);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomCount();
    return () => controller.abort();
  }, [roomType, rateType, token]);

  // Ensure selection is passed up
  useEffect(() => {
    if (selectedRooms) {
      onSelect?.(selectedRooms);
    }
  }, [selectedRooms]);

  const handleChange = (e) => {
    const value = e.target.value;
    setSelectedRooms(value);
    onSelect?.(value);
  };

  if (!roomType || !rateType) {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Number of Rooms
        </label>
        <select disabled className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100 text-gray-500">
          <option>Select room type & rate plan</option>
        </select>
      </div>
    );
  }
  

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Number of Rooms
      </label>
      {error && <p className="text-red-500 text-xs mb-1">{error}</p>}
      <select
        value={selectedRooms}
        onChange={handleChange}
        className={`border ${error ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 w-full`}
        disabled={roomCount === 0 || isLoading}
      >
        <option value="">
          {roomCount === 0 ? "No rooms available" : "Select number of rooms"}
        </option>
        {Array.from({ length: roomCount }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NumberOfRoomsDropdown;
