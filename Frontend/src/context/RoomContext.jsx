import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { socket } from '../../src/SocketClient'

const RoomContext = createContext();

export const RoomProvider = ({ children }) => {
  const { hotel, authLoading } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup socket connection
  
useEffect(() => {
  if (!hotel?.id || authLoading) return;

  socket.emit("joinHotel", { hotelId: hotel.id });

  socket.on("roomCleaningStatusUpdated", (payload) => {
    const updatedRoom = payload.data;
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === updatedRoom.id ? { ...room, cleaningStatus: updatedRoom.cleaningStatus } : room
      )
    );
  });

  return () => {
    socket.off("roomCleaningStatusUpdated");
  };
}, [hotel?.id, authLoading]);

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
        setRooms(response.data.rooms || []);
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
      refreshRooms: fetchRooms, // still keep for manual refresh if needed
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
