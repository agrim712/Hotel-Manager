import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const AvailableRoomNumbers = ({
  roomType,
  rateType,
  checkInDate,
  checkOutDate,
  token,
  onChange,
  initialSelectedRooms = []
}) => {
  const [roomNumbers, setRoomNumbers] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState(initialSelectedRooms);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const isMounted = useRef(false);

  // Fetch available rooms when parameters change
  const fetchAvailableRooms = useCallback(async (controller) => {
    if (!roomType || !rateType || !checkInDate || !checkOutDate || !token) {
      setRoomNumbers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('http://localhost:5000/api/hotel/available-rooms', {
        params: {
          roomType,
          rateType,
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString()
        },
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal
      });

      if (response.data?.success) {
        const available = response.data.rooms?.map(room => room.number) || [];
        if (isMounted.current) {
          setRoomNumbers(available);
          // Filter selected rooms to only include available ones
          setSelectedRooms(prev => prev.filter(num => available.includes(num)));
        }
      }
    } catch (err) {
      if (!axios.isCancel(err) && isMounted.current) {
        setError(err.message);
        setRoomNumbers([]);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [roomType, rateType, checkInDate, checkOutDate, token]);

  useEffect(() => {
    isMounted.current = true;
    const controller = new AbortController();
    fetchAvailableRooms(controller);
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [fetchAvailableRooms]);

  // Handle room selection
  const handleSelect = useCallback((roomNumber) => {
    setSelectedRooms(prev => {
      const newSelection = prev.includes(roomNumber)
        ? prev.filter(n => n !== roomNumber)
        : [...prev, roomNumber];
      return newSelection;
    });
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    if (onChange) {
      onChange(selectedRooms);
    }
  }, [selectedRooms, onChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Available Room Numbers
      </label>
      
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

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full border border-gray-300 bg-white rounded shadow-lg max-h-60 overflow-y-auto">
          {roomNumbers.length > 0 ? (
            roomNumbers.map((num) => (
              <div
                key={num}
                onClick={() => handleSelect(num)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  selectedRooms.includes(num) ? "bg-blue-100 font-medium" : ""
                }`}
              >
                {num}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500 italic">
              {isLoading ? "Loading..." : "No rooms available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(AvailableRoomNumbers);