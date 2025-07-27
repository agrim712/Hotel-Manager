import React from 'react';
import {
  FiUser, FiCheck, FiWifi, FiMapPin,
  FiClock, FiDollarSign, FiTv
} from 'react-icons/fi';
import {
  FaSwimmingPool, FaParking, FaUtensils, FaSpa,
  FaBed, FaSnowflake, FaShower, FaConciergeBell
} from 'react-icons/fa';
import { GiDesk, GiWashingMachine } from 'react-icons/gi';
import { IoIosFitness } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../../context/RoomContext';

const RoomDetailPage = () => {
  const { rooms, loading, error, hotelLoaded } = useRoom();
  const navigate = useNavigate();

  const amenityIcons = {
    'Free WiFi': <FiWifi className="text-indigo-600" size={20} />,
    'Breakfast included': <FaUtensils className="text-indigo-600" size={18} />,
    'Air conditioning': <FaSnowflake className="text-indigo-600" size={18} />,
    'Flat-screen TV': <FiTv className="text-indigo-600" size={18} />,
    'Minibar': <FiCheck className="text-indigo-600" size={18} />,
    'Safe': <FiCheck className="text-indigo-600" size={18} />,
    'Swimming Pool Access': <FaSwimmingPool className="text-indigo-600" size={18} />,
    'Parking': <FaParking className="text-indigo-600" size={18} />,
    'Restaurant': <FaUtensils className="text-indigo-600" size={18} />,
    'Spa': <FaSpa className="text-indigo-600" size={18} />,
    'King Bed': <FaBed className="text-indigo-600" size={18} />,
    'Private Bathroom': <FaShower className="text-indigo-600" size={18} />,
    'Work Desk': <GiDesk className="text-indigo-600" size={18} />,
    'Fitness Center': <IoIosFitness className="text-indigo-600" size={20} />,
    'Laundry Service': <GiWashingMachine className="text-indigo-600" size={18} />,
    '24/7 Room Service': <FaConciergeBell className="text-indigo-600" size={18} />
  };

  if (!hotelLoaded || loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="text-red-500 text-xl font-medium mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!rooms || rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6 text-center">
        <div className="text-gray-600 text-xl font-medium mb-4">No rooms available</div>
        <button 
          onClick={() => navigate(-1)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Room Units</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {rooms.map((roomUnit) => {
            const room = roomUnit.room || {};
            const roomImages = room.roomImages?.length > 0 
              ? room.roomImages.map(img => img.url)
              : [];

            return (
              <div key={roomUnit.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition">
                {/* Room Image */}
                {roomImages.length > 0 && (
                  <div className="relative h-48">
                    <img
                      src={roomImages[0]}
                      alt={room.name || 'Room'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* Header: Room Name + Rate */}
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {room.name || 'Room'}
                    </h2>
                    <div className="text-right">
                      <div className="text-xl font-bold text-indigo-600">
                        ₹{(room.rate || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">per night</div>
                    </div>
                  </div>

                  {/* RoomUnit Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                    <div>Room No: <span className="font-medium">{roomUnit.roomNumber}</span></div>
                    <div>Floor: <span className="font-medium">{roomUnit.floor}</span></div>
                    <div>Status: <span className="font-medium">{roomUnit.status}</span></div>
                    <div>Max Guests: <span className="font-medium">{room.maxGuests || 2}</span></div>
                    <div>Rate Type: <span className="font-medium">{room.rateType || 'N/A'}</span></div>
                  </div>

                  {/* Description */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                    <p className="text-gray-600 text-sm">
                      {room.description || 'No description available'}
                    </p>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Amenities</h4>
                    <div className="flex flex-wrap gap-2">
                      {room.amenities?.length > 0 ? (
                        room.amenities.map((amenity, index) => (
                          <span key={index} className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                            {amenityIcons[amenity.label] || <FiCheck className="text-indigo-600 mr-1" size={12} />}
                            <span className="ml-1">{amenity.label}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-500">No amenities listed</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailPage;
