// src/context/ReservationContext.js
import axios from 'axios';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  console.log(token);
  const api = axios.create({
    baseURL: 'http://localhost:5000/api/hotel',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

  const fetchReservations = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/getreservations', { params });
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
      await api.delete(`/reservations/${bookingId}`);
      setReservations((prev) => prev.filter((r) => r.id !== bookingId));
    } catch (err) {
      console.error('Error deleting reservation:', err);
      throw err;
    }
  };

  const generateBill = async (reservationId) => {
    try {
      const response = await api.get(`/bill/generate/${reservationId}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reservationId}-bill.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Bill generation failed:', error);
      throw error;
    }
  };

  const addBillItems = async (reservationId, items) => {
    try {
      const response = await api.post(`/reservation/${reservationId}/bill/items`, { items });
      return response.data.data;
    } catch (error) {
      console.error('Error adding bill items:', error);
      throw error;
    }
  };

  const finalizeBill = async (reservationId, billData) => {
    try {
      const response = await api.post(`/reservation/${reservationId}/bill/finalize`, billData);
      return response.data.data;
    } catch (error) {
      console.error('Error finalizing bill:', error);
      throw error;
    }
  };

  const downloadInvoice = async (reservationId) => {
    try {
      const response = await api.get(`/invoice/${reservationId}`, {
        responseType: 'blob',
      });

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
    <ReservationContext.Provider
      value={{
        reservations,
        loading,
        error,
        fetchReservations,
        deleteReservation,
        setReservations,
        addBillItems,
        finalizeBill,
        generateBill,
        downloadInvoice,
      }}
    >
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
