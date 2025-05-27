import React, { createContext, useContext, useState } from 'react';

const ReservationContext = createContext();

export const useReservationContext = () => useContext(ReservationContext);

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);

  const addReservation = (newReservation) => {
    setReservations((prev) => [...prev, newReservation]);
  };

  return (
    <ReservationContext.Provider value={{ reservations, setReservations, addReservation }}>
      {children}
    </ReservationContext.Provider>
  );
};
