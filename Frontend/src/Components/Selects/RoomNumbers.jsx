// RoomNumbers.jsx
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = 'http://localhost:5000/api'; // Temporary - configure properly later

const AvailableRoomNumbers = ({ 
  roomType, 
  rateType, 
  checkInDate, 
  checkOutDate, 
  token, 
  onChange 
}) => {
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAvailableRooms = async () => {
      // Skip if required data is missing
      if (!roomType || !rateType || !checkInDate || !checkOutDate || !token) {
        setRoomNumbers([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${API_BASE_URL}/hotel/available-rooms`,
          {
            params: {
              roomType,
              rateType,
              checkInDate: checkInDate.toISOString(),
              checkOutDate: checkOutDate.toISOString()
            },
            headers: { 
              Authorization: `Bearer ${token}` 
            },
            signal: controller.signal
          }
        );

        if (response.data?.success && response.data?.rooms) {
          setRoomNumbers(response.data.rooms.map(room => room.number));
        } else {
          throw new Error(response.data?.message || 'No rooms available');
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching available room numbers:", error);
          setError(error.response?.data?.message || error.message);
          setRoomNumbers([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableRooms();

    return () => controller.abort();
  }, [roomType, rateType, checkInDate, checkOutDate, token]);

  // ... rest of your component code ...

  const handleSelect = (num) => {
    const updated = selectedRooms.includes(num)
      ? selectedRooms.filter(n => n !== num)
      : [...selectedRooms, num];
    
    setSelectedRooms(updated);
    onChange?.(updated);
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
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border ${error ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2 cursor-pointer bg-white flex items-center justify-between`}
      >
        <span className={selectedRooms.length === 0 ? "text-gray-400" : ""}>
          {selectedRooms.length > 0 ? selectedRooms.join(", ") : "Select room numbers"}
        </span>
        {isLoading ? (
          <span className="text-gray-500 text-xs">Loading...</span>
        ) : (
          <span className="text-gray-500">▼</span>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded shadow-lg max-h-60 overflow-y-auto">
          {roomNumbers.length > 0 ? (
            roomNumbers.map((num) => (
              <div
                key={num}
                onClick={() => handleSelect(num)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  selectedRooms.includes(num) 
                    ? "bg-blue-100 font-medium text-blue-800" 
                    : ""
                }`}
              >
                {num}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">
              {isLoading ? "Loading rooms..." : "No available rooms found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AvailableRoomNumbers;