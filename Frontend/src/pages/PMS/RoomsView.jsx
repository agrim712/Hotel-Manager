import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const RoomsViews = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoomUnit, setSelectedRoomUnit] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000');
    const hotelId = localStorage.getItem('hotelId');

    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/hotel/rooms-with-units', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.rooms || !Array.isArray(data.rooms)) {
          throw new Error('Invalid data format: expected rooms array');
        }

        setRooms(data.rooms);
        setLoading(false);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
        setLoading(false);
        setRooms([]);
      }
    };

    fetchRooms();

    socket.on('connect', () => {
      if (hotelId) socket.emit('join-hotel', hotelId);
    });

    socket.on('room-status-update', (updatedRoom) => {
      setRooms(prevRooms => {
        if (!Array.isArray(prevRooms)) return prevRooms;
        return prevRooms.map(room =>
          room.id === updatedRoom.id ? updatedRoom : room
        );
      });
    });

    socket.on('reservation-update', () => {
      fetchRooms();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedRoomUnit || updatingStatus) return;

    setUpdatingStatus(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:5000/api/hotel/roomunits/${selectedRoomUnit.id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedRoom = await response.json();

      setRooms(prevRooms => {
        return prevRooms.map(room => ({
          ...room,
          roomUnits: room.roomUnits.map(unit =>
            unit.id === updatedRoom.data.id ? updatedRoom.data : unit
          )
        }));
      });

      setSuccessMessage(`Status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Status update failed:', error);
      setError('Failed to update room status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    const base = 'border rounded-lg p-2 text-center transition-transform hover:scale-105';
    switch (status) {
      case 'BOOKED': return `${base} bg-red-100 border-red-500 text-red-800`;
      case 'AVAILABLE': return `${base} bg-green-100 border-green-500 text-green-800`;
      case 'MAINTENANCE': return `${base} bg-yellow-100 border-yellow-500 text-yellow-800`;
      case 'CLEANING': return `${base} bg-blue-100 border-blue-500 text-blue-800`;
      default: return `${base} bg-gray-100 border-gray-500 text-gray-800`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'BOOKED': return '🔴';
      case 'AVAILABLE': return '🟢';
      case 'MAINTENANCE': return '🛠️';
      case 'CLEANING': return '🧹';
      default: return '⚪';
    }
  };

  const StatusModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
        <h3 className="text-lg font-bold mb-4">Change Room Status</h3>
        <p className="mb-4">Room {selectedRoomUnit?.roomNumber}</p>

        <div className="space-y-2">
          {['BOOKED', 'AVAILABLE', 'MAINTENANCE'].map((status) => (
            <button
              key={status}
              className={`w-full py-2 px-4 rounded border ${getStatusColor(status)} ${updatingStatus ? 'opacity-50' : ''}`}
              onClick={() => handleStatusUpdate(status)}
              disabled={updatingStatus}
            >
              {getStatusIcon(status)} {status}
            </button>
          ))}
        </div>

        <button
          className="mt-4 w-full py-2 px-4 bg-gray-100 rounded hover:bg-gray-200"
          onClick={() => setShowStatusModal(false)}
          disabled={updatingStatus}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#e3efff] to-[#f6f9ff]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-400 rounded-full mb-4"></div>
          <div className="h-4 bg-blue-400 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#e3efff] to-[#f6f9ff]">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 max-w-md rounded shadow">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e3efff] to-[#f6f9ff] p-6">
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow z-50">
          <p>{successMessage}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
        <h1 class="text-4xl font-extrabold mb-8 text-center text-indigo-800 drop-shadow-lg uppercase tracking-wider border-b-4 border-indigo-300 pb-2">Hotel Rooms Overview</h1>
          <p className="text-gray-600 text-sm">Manage and view all room types and their current status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{room.name}</h2>
                    <p className="text-sm text-gray-500">Max {room.maxGuests} guests</p>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                    ₹{room.rate} <span className="text-xs">/{room.rateType}</span>
                  </div>
                </div>

                {room.extraAdultRate > 0 && (
                  <div className="mb-4 text-sm">
                    <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      +₹{room.extraAdultRate} for extra adult
                    </span>
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                    Room Units ({room.roomUnits.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {room.roomUnits.map((unit) => (
                      <div
                        key={unit.id}
                        className={`${getStatusColor(unit.status)} ${
                          updatingStatus && selectedRoomUnit?.id === unit.id
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                        onClick={() => {
                          if (!updatingStatus) {
                            setSelectedRoomUnit(unit);
                            setShowStatusModal(true);
                          }
                        }}
                        title={unit.status}
                      >
                        <div className="text-sm mb-1">{getStatusIcon(unit.status)}</div>
                        <div className="font-semibold text-sm">{unit.roomNumber}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-xs text-gray-500">
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
                <button
                  className="bg-white border border-gray-200 px-3 py-1 rounded-full hover:bg-gray-100 transition"
                  onClick={() => navigate('/pmss/reservation/create/regular')}
                >
                  Create Reservation
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showStatusModal && <StatusModal />}
    </div>
  );
};

export default RoomsViews;
