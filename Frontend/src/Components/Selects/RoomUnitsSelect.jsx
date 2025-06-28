import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RoomUnits = ({ value, onChange, roomType, rateType, token }) => {
  const [allUnits, setAllUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all room units when component mounts or token changes
  useEffect(() => {
    const fetchAllRoomUnits = async () => {
      if (!token) {
        setAllUnits([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get('http://localhost:5000/api/hotel/roomunits', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setAllUnits(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching room units:", err);
        setError(err.response?.data?.error || "Failed to load room units");
        setAllUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllRoomUnits();
  }, [token]);

  // Filter units based on roomType and rateType
  useEffect(() => {
    if (!roomType) {
      setFilteredUnits([]);
      return;
    }

    let result = allUnits.filter(unit => unit.type === roomType);
    
    if (rateType) {
      result = result.filter(unit => unit.rateType === rateType);
    }

    setFilteredUnits(result);
  }, [allUnits, roomType, rateType]);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
        disabled={loading || !roomType}
      >
        <option value="">Select Room Unit</option>
        {filteredUnits.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.roomNumber} ({unit.status})
          </option>
        ))}
      </select>

      {/* Status indicators */}
      {loading && (
        <p className="absolute text-sm text-gray-500 mt-1">Loading rooms...</p>
      )}
      {error && (
        <p className="absolute text-sm text-red-500 mt-1">{error}</p>
      )}
      {!loading && !error && roomType && filteredUnits.length === 0 && (
        <p className="absolute text-sm text-yellow-500 mt-1">
          {allUnits.length === 0 
            ? "No rooms available" 
            : `No ${rateType ? rateType + ' ' : ''}rooms of type ${roomType} available`}
        </p>
      )}
    </div>
  );
};

export default RoomUnits;