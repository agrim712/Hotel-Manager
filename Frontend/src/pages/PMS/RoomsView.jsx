import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RoomsViews = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
        return 'bg-rose-100 border-rose-500 text-rose-800';
      case 'AVAILABLE':
        return 'bg-emerald-100 border-emerald-500 text-emerald-800 hover:bg-emerald-200 cursor-pointer';
      case 'MAINTENANCE':
        return 'bg-amber-100 border-amber-500 text-amber-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'BOOKED':
        return '🔴';
      case 'AVAILABLE':
        return '🟢';
      case 'MAINTENANCE':
        return '🛠️';
      default:
        return '🔵';
    }
  };

  const handleRoomClick = (roomTypeId, roomUnitId) => {
    navigate(`/pmss/reservation/create/regular?roomType=${roomTypeId}&roomUnit=${roomUnitId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-400 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-400 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hotel Rooms Overview</h1>
          <p className="text-gray-600">Manage and view all room types and their current status</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div 
              key={room.id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{room.name}</h2>
                    <p className="text-sm text-gray-500">Max {room.maxGuests} guests</p>
                  </div>
                  <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ₹{room.rate} <span className="text-xs font-normal">/{room.rateType}</span>
                  </div>
                </div>
                
                {room.extraAdultRate > 0 && (
                  <div className="mb-4 flex items-center text-sm">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                      +₹{room.extraAdultRate} for extra adult
                    </span>
                  </div>
                )}
                
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Room Units ({room.roomUnits.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {room.roomUnits.map((unit) => (
                      <div 
                        key={unit.id} 
                        className={`${getStatusColor(unit.status)} border rounded-lg p-2 text-center transition-transform hover:scale-105`}
                        title={unit.status}
                        onClick={() => unit.status === 'AVAILABLE' ? handleRoomClick(room.id, unit.id) : null}
                      >
                        <div className="text-xs mb-1">{getStatusIcon(unit.status)}</div>
                        <div className="font-bold text-sm">{unit.roomNumber}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
                <button 
                  className="text-xs bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => navigate('/pmss/reservation/create/regular')}
                >
                  Create Reservation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoomsViews;