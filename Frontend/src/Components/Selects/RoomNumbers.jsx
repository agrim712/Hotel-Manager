import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const AvailableRoomNumbers = ({ roomType, rateType, token, onChange }) => {
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchAvailableRooms = async () => {
      if (!roomType || !rateType || !token) return;

      try {
        const response = await axios.get(
          `http://localhost:5000/api/hotel/room-available-numbers`,
          {
            params: { roomType, rateType },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRoomNumbers(response.data.roomNumbers || []);
      } catch (error) {
        console.error("❌ Error fetching available room numbers:", error);
        setRoomNumbers([]);
      }
    };

    fetchAvailableRooms();
  }, [roomType, rateType, token]);

  const handleSelect = (num) => {
    let updated;
    if (selectedRooms.includes(num)) {
      updated = selectedRooms.filter((n) => n !== num);
    } else {
      updated = [...selectedRooms, num];
    }
    setSelectedRooms(updated);
    onChange?.(updated.join(","));
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Room Numbers
      </label>

      {/* Input-like display */}
      <input
        type="text"
        readOnly
        value={selectedRooms.join(", ")}
        onClick={() => setIsOpen(!isOpen)}
        placeholder="Select room numbers"
        className="w-full border border-gray-300 rounded px-3 py-2 cursor-pointer bg-white"
      />

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded shadow max-h-60 overflow-y-auto">
          {roomNumbers.length > 0 ? (
            roomNumbers.map((num) => (
              <div
                key={num}
                onClick={() => handleSelect(num)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  selectedRooms.includes(num) ? "bg-gray-100 font-semibold" : ""
                }`}
              >
                {num}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">
              No available rooms found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableRoomNumbers;
