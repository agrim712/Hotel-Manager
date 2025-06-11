import React from 'react';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';

const RoomRow = ({ room, unit, reservations, startDate, visibleDays, showRoomName }) => {
  const dates = Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i));

  const getStatusForDate = (date) => {
    const day = startOfDay(date);

    // 🧠 Log the room + unit we're checking
    console.log(`\n🏠 === CHECKING ROOM ${unit.roomNumber} (${room.name}) FOR DATE ${format(day, 'yyyy-MM-dd')} ===`);

    // Filter matching reservations
    const matchingReservations = reservations.filter((resv) => {
      const matches = (
        resv.roomUnitId === unit.id ||
        resv.roomNo === unit.roomNumber ||
        resv.roomNumber === unit.roomNumber ||
        String(resv.roomNo) === String(unit.roomNumber) ||
        String(resv.roomNumber) === String(unit.roomNumber) ||
        (resv.roomType?.name === room.name && String(resv.roomNo) === String(unit.roomNumber))
      );
      return matches;
    });

    console.log("🧠 Matching RESERVATIONS for unit", unit.roomNumber, "roomType", room.name);
    console.table(matchingReservations);

    for (const resv of matchingReservations) {
      try {
        const checkInDate = startOfDay(new Date(resv.checkIn));
        const checkOutDate = startOfDay(new Date(resv.checkOut));

        if (isSameDay(day, checkOutDate)) {
          return 'Cleaning';
        }

        if (day >= checkInDate && day < checkOutDate) {
          return 'Occupied';
        }
      } catch (err) {
        console.error('❌ Error parsing reservation dates:', err, resv);
      }
    }

    if (unit.status === 'Out of Order' || unit.status === 'MAINTENANCE') {
      return 'Out of Order';
    }

    return 'Available';
  };

  const statusIcons = {
    Available: '✅',
    Occupied: '❌',
    Reserved: '⏳',
    Cleaning: '🧹',
    'Out of Order': '🚫',
    AVAILABLE: '✅',
    BOOKED: '❌',
    MAINTENANCE: '🚫',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Occupied':
      case 'BOOKED':
        return 'text-red-500 bg-red-50';
      case 'Cleaning':
        return 'text-orange-500 bg-orange-50';
      case 'Out of Order':
      case 'MAINTENANCE':
        return 'text-gray-500 bg-gray-50';
      case 'Reserved':
        return 'text-yellow-500 bg-yellow-50';
      case 'Available':
      case 'AVAILABLE':
      default:
        return 'text-green-500 bg-green-50';
    }
  };

  const gridCols = `150px 150px repeat(${visibleDays}, 1fr)`;

  return (
    <div 
      className="grid border-b text-sm hover:bg-gray-50 transition-colors"
      style={{ gridTemplateColumns: gridCols }}
    >
      <div className="p-3 flex items-center border-r border-gray-100">
        <div className="font-medium text-gray-700">
          {showRoomName ? room.name : ''}
        </div>
      </div>
      
      <div className="p-3 flex items-center border-r border-gray-100">
        <div className="font-semibold text-gray-800">
          {unit.roomNumber}
        </div>
      </div>
      
      {dates.map((date, idx) => {
        const status = getStatusForDate(date);
        const icon = statusIcons[status] || '✅';
        const colorClass = getStatusColor(status);

        return (
          <div
            key={idx}
            className={`p-2 text-center border-r border-gray-100 transition-all duration-200 hover:scale-105 ${colorClass}`}
            title={`${format(date, 'EEE, MMM dd, yyyy')}\nStatus: ${status}\nRoom: ${unit.roomNumber}\nRoom Type: ${room.name}`}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">{icon}</span>
              <span className="text-xs mt-1 font-medium opacity-75">
                {status === 'Available' ? 'Free' : 
                 status === 'Occupied' ? 'Busy' : 
                 status === 'Cleaning' ? 'Clean' : 
                 status === 'Out of Order' ? 'OOO' : status}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RoomRow;
