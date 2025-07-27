import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { hotel, authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
    if (authLoading || !hotel?.id) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/hotel/rooms-with-units', {
        headers: { Authorization: `Bearer ${token}` },
        params: { hotelId: hotel.id }
      });

      if (response.data?.success) {
        setRooms(response.data.rooms || []); // <-- uses 'rooms' key from backend
      } else {
        throw new Error(response.data?.error || 'Failed to fetch rooms');
      }
    } catch (err) {
      console.error('Room fetch error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && hotel?.id) {
      fetchRooms();
    }
  }, [hotel?.id, authLoading]);

  return (
    <RoomContext.Provider value={{
      rooms,
      loading: loading || authLoading,
      error,
      fetchRooms,
      hotelLoaded: !!hotel?.id && !authLoading
    }}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
