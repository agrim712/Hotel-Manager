import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RoomsViews = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        
         const response = await axios.get('http://localhost:5000/api/hotel/rooms-with-units', {
             headers: {
             Authorization: `Bearer ${token}`,
           },
        });
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'BOOKED':
        return 'bg-red-500';
      case 'AVAILABLE':
        return 'bg-green-500';
      case 'MAINTENANCE':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading rooms...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Hotel Rooms</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="border rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Room Type: {room.name}</h2>
              <div className="text-sm">
                <span className="font-medium">Rate: ₹{room.rate}</span> ({room.rateType})
              </div>
            </div>
            
            <div className="mb-2">
              <span className="font-medium">Max Guests:</span> {room.maxGuests}
              {room.extraAdultRate > 0 && (
                <span className="text-sm text-gray-600 ml-2">(Extra adult: ₹{room.extraAdultRate})</span>
              )}
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Room Units:</h3>
              <div className="grid grid-cols-2 gap-2">
                {room.roomUnits.map((unit) => (
                  <div 
                    key={unit.id} 
                    className={`p-2 rounded-md text-white text-center ${getStatusColor(unit.status)}`}
                  >
                    <div className="font-bold">{unit.roomNumber}</div>
                    <div className="text-xs">{unit.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomsViews;