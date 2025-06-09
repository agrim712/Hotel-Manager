import React from 'react';
import { format, addDays, isWithinInterval } from 'date-fns';

const RoomRow = ({ room, reservations, startDate, visibleDays }) => {
  const dates = Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i));

  // Helper to get reservation status for a specific room unit and date
  const getStatusForDate = (roomNumber, date) => {
    const reservation = reservations.find((resv) =>
      resv.roomNumber === roomNumber &&
      isWithinInterval(date, { start: new Date(resv.checkIn), end: new Date(resv.checkOut) })
    );
    if (reservation) {
      return reservation.status || 'Reserved';
    }
    return 'Available';
  };

  const statusSigns = {
    Available: '✔️',
    Occupied: '❌',
    Reserved: '⏳',
    'Out of Order': '🚫',
    Cleaning: '🧹',
  };

  return (
    <>
      {room.roomUnits.map((unit) => (
        <div
          key={unit.id}
          className="grid grid-cols-[150px_150px_repeat(7,1fr)] border-b text-sm"
        >
          {/* Room Name: only show for first unit */}
          <div className="p-2 flex items-center">
            {unit === room.roomUnits[0] ? room.name : ''}
          </div>

          {/* Room Number */}
          <div className="p-2 flex items-center">{unit.roomNumber}</div>

          {/* Status for each date */}
          {dates.map((date, idx) => {
            const status = getStatusForDate(unit.roomNumber, date);
            const sign = statusSigns[status] || '?';
            return (
              <div
                key={idx}
                className="p-2 text-center border-l"
                title={`${format(date, 'dd MMM yyyy')} - ${status}`}
              >
                <span className="text-lg">{sign}</span>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default RoomRow;
