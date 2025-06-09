import React, { useState, useEffect } from 'react';
import RoomRow from './RoomRow';
import { format, addDays } from 'date-fns';

const RoomStatusLegend = () => {
  const statuses = [
    { label: "Available", sign: "✔️" },
    { label: "Occupied", sign: "❌" },
    { label: "Reserved", sign: "⏳" },
    { label: "Out of Order", sign: "🚫" },
    { label: "Cleaning", sign: "🧹" },
  ];

  return (
    <div className="flex gap-6 mb-4 p-4 bg-white border-b">
      {statuses.map(({ label, sign }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="font-bold">{sign}</span>
          <span className="text-sm font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
};

const StayView = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const visibleDays = 7;

  useEffect(() => {
    fetchRoomsAndReservations();
  }, [startDate]);

  const fetchRoomsAndReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found');
  
      const [roomsRes, reservationsRes] = await Promise.all([
        fetch('http://localhost:5000/api/hotel/rooms-with-units', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/hotel/getreservations', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
  
      const roomsJson = await roomsRes.json();
      const reservationsJson = await reservationsRes.json();
  
      console.log("✅ Rooms:", roomsJson);
      console.log("✅ Reservations:", reservationsJson);
  
      const fetchedRooms = Array.isArray(roomsJson)
        ? roomsJson
        : roomsJson.rooms || [];
  
      setRooms(fetchedRooms);
      setReservations(reservationsJson.reservations || []);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const getDates = () =>
    Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i));

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="overflow-auto border rounded-lg shadow bg-white">
      <RoomStatusLegend />

      <div className="sticky top-[56px] z-10 bg-white">
        <div className="grid grid-cols-[150px_150px_repeat(7,1fr)] border-b font-medium text-sm">
          <div className="p-2 bg-gray-100">Room</div>
          <div className="p-2 bg-gray-100">Room Number</div>
          {getDates().map((date, idx) => (
            <div key={idx} className="p-2 text-center border-l">
              {format(date, 'dd MMM')}
            </div>
          ))}
        </div>
      </div>

      <div>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomRow
              key={room.id}
              room={room}
              reservations={reservations.filter(
                (r) => r.roomUnitId === room.id
              )}
              startDate={startDate}
              visibleDays={visibleDays}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No rooms available.</div>
        )}
      </div>
    </div>
  );
};

export default StayView;
