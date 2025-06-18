import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DepartureReportTable = ({ fromDate, toDate }) => {
  const [departures, setDepartures] = useState([]);
  const [roomStatusMap, setRoomStatusMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDepartures = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/hotel/getreservations', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Use fromDate/toDate if passed, else fallback to today
    const from = fromDate ? new Date(fromDate) : new Date();
    const to = toDate ? new Date(toDate) : new Date();

    // Normalize time range to catch all departures on the same day
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const filtered = response.data.data.filter((res) => {
      const checkOut = new Date(res.checkOut);
      return checkOut >= from && checkOut <= to;
    });

    setDepartures(filtered);
  } catch (err) {
    setError('Failed to load departure report.');
  } finally {
    setLoading(false);
  }
};
const fetchRoomStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/api/hotel/rooms-with-units', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const map = {};
    response.data.rooms.forEach((room) => {
      room.roomUnits.forEach((unit) => {
        const roomNoKey = String(unit.roomNumber).trim(); // 👈 normalize
        map[roomNoKey] = unit.status;
      });
    });

    setRoomStatusMap(map);
  } catch (err) {
    console.error('Failed to fetch room statuses', err);
  }
};




useEffect(() => {
  if (fromDate && toDate) {
    fetchDepartures();
    fetchRoomStatus(); // 👈 added
  }
}, [fromDate, toDate]);


  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-GB');
const getStatusLabel = (roomNo) => {
  const normalized = String(roomNo).trim(); // 👈 normalize input
  const status = roomStatusMap[normalized];

  if (!status) return 'Unknown';
  return status === 'BOOKED' ? 'Checked In' : 'Checked Out';
};
console.log("roomStatusMap:", roomStatusMap);
console.log("departures:", departures.map(d => d.roomNo));

  return (
    <div className="mt-4 overflow-x-auto">
      <h2 className="text-sm font-semibold mb-2">Today's Departures</h2>
      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-xs mb-2">{error}</div>
      ) : (
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
              <th className="border p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {departures.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center border p-2">
                  No departures in selected range.
                </td>
              </tr>
            ) : (
              departures.map((res, index) => (
                <tr key={res.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border p-2">{res.guestName}</td>
                  <td className="border p-2">{res.roomNo}</td>
                  <td className="border p-2">{formatDate(res.checkIn)}</td>
                  <td className="border p-2">{formatDate(res.checkOut)}</td>
                  <td className="border p-2">{res.nights}</td>
                  <td className="border p-2">{res.guests}</td>
                  <td className="border p-2">{res.rateType}</td>
                  <td className="border p-2">{res.totalAmount}</td>
                  <td className="border p-2">{getStatusLabel(res.roomNo)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DepartureReportTable;
