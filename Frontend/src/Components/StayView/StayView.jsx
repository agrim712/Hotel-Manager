// ✅ Updated StayView.jsx - UI matched with screenshot

import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, isToday } from 'date-fns';
import { io } from 'socket.io-client';
import RoomRow from './RoomRow';

const StayView = () => {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const visibleDays = 7;

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
      const resvJson = await reservationsRes.json();

      const fetchedRooms = roomsJson?.rooms ||  [];
      const fetchedReservations = resvJson?.data || resvJson?.reservations || [];

      setRooms(fetchedRooms);
      setReservations(fetchedReservations);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsAndReservations();
  }, [startDate]);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    const hotelId = localStorage.getItem('hotelId');

    socket.on('connect', () => {
      if (hotelId) socket.emit('join-hotel', hotelId);
    });

    socket.on('reservation-update', () => {
      fetchRoomsAndReservations();
    });

    socket.on('room-status-update', () => {
      fetchRoomsAndReservations();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredRooms = useMemo(() => {
    if (!rooms.length) return [];
    return rooms.filter(room => {
      const matchesSearch =
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomUnits?.some(unit => unit.roomNumber.toString().includes(searchTerm));

      const matchesStatus = filterStatus === 'All' || room.roomUnits?.some(unit => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOutOfOrder = unit.status === 'Out of Order' || unit.status === 'MAINTENANCE';

        const isOccupied = reservations.some(resv => {
          try {
            const checkIn = new Date(resv.checkIn);
            const checkOut = new Date(resv.checkOut);
            checkIn.setHours(0, 0, 0, 0);
            checkOut.setHours(0, 0, 0, 0);
            const match = resv.roomUnitId === unit.id ||
                          resv.roomNo == unit.roomNumber ||
                          resv.roomNumber == unit.roomNumber;
            return match && today >= checkIn && today < checkOut;
          } catch {
            return false;
          }
        });

        if (filterStatus === 'Available') return !isOccupied && !isOutOfOrder;
        if (filterStatus === 'Occupied') return isOccupied;
        if (filterStatus === 'Out of Order') return isOutOfOrder;
        return true;
      });

      return matchesSearch && matchesStatus;
    });
  }, [rooms, reservations, searchTerm, filterStatus]);

  const navigateWeek = (direction) => {
    setStartDate((prev) => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading stay view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 to-blue-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
            <h1 class="text-4xl font-extrabold mb-8 text-indigo-800 drop-shadow-lg uppercase tracking-wider border-b-4 border-indigo-300 pb-2">Stay View</h1>
              <p className="text-gray-500 text-sm">Manage your property availability and reservations</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {[['All','📋'], ['Available','✅'], ['Occupied','📌'], ['Out of Order','🚫']].map(([status, icon]) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 shadow-sm transition-colors border ${
                    filterStatus === status ? 'bg-white text-blue-700 border-blue-500' : 'bg-white text-gray-600 border-gray-300'
                  }`}
                >
                  <span>{icon}</span> {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl shadow">
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 placeholder-gray-400 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600"
              >📅 Today</button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 rounded-md hover:bg-gray-100"
              >◀</button>
              <div className="font-semibold text-gray-800">
                {format(startDate, 'MMM dd')} - {format(addDays(startDate, visibleDays - 1), 'MMM dd, yyyy')}
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 rounded-md hover:bg-gray-100"
              >▶</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-40 p-3 border-r border-gray-200 text-sm font-medium text-gray-700">Room Type</div>
              <div className="w-28 p-3 border-r border-gray-200 text-sm font-medium text-gray-700">Room #</div>
              <div className="flex-1 flex">
                {Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i)).map(
                  (date, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 p-2 border-r border-gray-200 last:border-r-0 text-center ${
                        isToday(date) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      <div className="text-xs font-medium">{format(date, 'EEE')}</div>
                      <div className="text-base font-semibold">{format(date, 'dd')}</div>
                      <div className="text-xs text-gray-400 hidden md:block">{format(date, 'MMM')}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) =>
                room.roomUnits?.map((unit, index) => (
                  <RoomRow
                    key={unit.id}
                    room={room}
                    unit={unit}
                    reservations={reservations}
                    startDate={startDate}
                    visibleDays={visibleDays}
                    showRoomName={index === 0}
                  />
                ))
              )
            ) : (
              <div className="p-8 text-center text-gray-500">
                <div className="text-3xl mb-2">🏨</div>
                <p className="text-base font-medium">No rooms found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StayView;