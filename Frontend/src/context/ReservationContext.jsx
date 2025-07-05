// src/context/ReservationContext.js
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: 'http://localhost:5000/api/hotel',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  const fetchReservations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
<<<<<<< Updated upstream
      
      const response = await api.get('http://localhost:5000/api/hotel/getreservations', { params });
=======

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true // ✅ important if backend uses cookies or expects it
      });

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      await api.delete(`http://localhost:5000/api/hotel/reservation/delete/${bookingId}`);
=======
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found');

      await axios.delete(`http://localhost:5000/api/hotel/reservations/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
>>>>>>> Stashed changes
      setReservations(prev => prev.filter(r => r.id !== bookingId));
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  };

  // const getReservationBill = async (reservationId) => {
  //   try {
  //     const response = await api.get(`http://localhost:5000/api/hotel/reservation/${reservationId}/bill`);
  //     return response.data.data;
  //   } catch (error) {
  //     console.error('Error fetching bill:', error);
  //     throw error;
  //   }
  // };
const generateBill = async (reservationId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/hotel/bill/generate/${reservationId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${reservationId}-bill.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url); // clean up
  } catch (error) {
    console.error('Bill generation failed:', error);
    throw error;
  }
};


  const addBillItems = async (reservationId, items) => {
    try {
      const response = await api.post(`http://localhost:5000/api/hotel/reservation/${reservationId}/bill/items`, { items });
      return response.data.data;
    } catch (error) {
      console.error('Error adding bill items:', error);
      throw error;
    }
  };

  const finalizeBill = async (reservationId, billData) => {
    try {
      const response = await api.post(`http://localhost:5000/api/hotel/reservation/${reservationId}/bill/finalize`, billData);
      return response.data.data;
    } catch (error) {
      console.error('Error finalizing bill:', error);
      throw error;
    }
  };

  const downloadInvoice = async (reservationId) => {
    try {
      const response = await api.get(`/invoice/${reservationId}`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a blob URL for the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${reservationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <ReservationContext.Provider value={{
      reservations,
      loading,
      error,
      fetchReservations,
      deleteReservation,
      setReservations,
      addBillItems,
      finalizeBill,
      generateBill,
      downloadInvoice
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
