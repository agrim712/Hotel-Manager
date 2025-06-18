import React from 'react';

const ArrivalReportTable = ({ data }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getStatus = (reservation) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkInDate = new Date(reservation.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    const now = new Date();

    if (checkInDate > today) return 'Upcoming';
    if (reservation.actualCheckIn) return 'Checked In';
    return now >= checkInDate ? 'Not Checked In' : 'Upcoming';
  };

  if (data.length === 0) {
    return <div className="text-center border p-2">No arrivals in selected range.</div>;
  }

  return (
    <table className="min-w-full border-collapse text-xs">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="border p-2">Guest Name</th>
          <th className="border p-2">Room No.</th>
          <th className="border p-2">Check-in</th>
          <th className="border p-2">Check-out</th>
          <th className="border p-2">Nights</th>
          <th className="border p-2">Guests</th>
          <th className="border p-2">Rate Type</th>
          <th className="border p-2">Total (INR)</th>
        </tr>
      </thead>
      <tbody>
        {data.map((reservation, index) => (
          <tr key={reservation.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            <td className="border p-2">{reservation.guestName}</td>
            <td className="border p-2">{reservation.roomNo}</td>
            <td className="border p-2">{formatDate(reservation.checkIn)}</td>
            <td className="border p-2">{formatDate(reservation.checkOut)}</td>
            <td className="border p-2">{reservation.nights}</td>
            <td className="border p-2">{reservation.guests}</td>
            <td className="border p-2">{reservation.rateType}</td>
            <td className="border p-2">{reservation.totalAmount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ArrivalReportTable;
