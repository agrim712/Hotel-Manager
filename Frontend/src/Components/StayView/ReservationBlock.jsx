import React from 'react';

const ReservationBlock = ({ reservation }) => {
  return (
    <div className="absolute inset-1 bg-blue-500 text-white text-xs rounded px-1 truncate">
      {reservation.guestName}
    </div>
  );
};

export default ReservationBlock;
