// src/context/ReservationContext.js
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReservations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setReservations(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.response?.data?.message || err.message);
      setReservations([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReservation = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5000/api/hotel/reservations/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReservations(prev => prev.filter(r => r.id !== bookingId));
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  };

  useEffect(() => {
    // Initial fetch with default parameters
    fetchReservations();
  }, []);

  return (
    <ReservationContext.Provider value={{
      reservations,
      loading,
      error,
      fetchReservations,
      deleteReservation,
      setReservations
    }}>
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservationContext = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservationContext must be used within a ReservationProvider');
  }
  return context;
};