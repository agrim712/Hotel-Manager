

// import React, { useState, useEffect, useMemo } from 'react';
// import { format, addDays, subDays, isToday, isSameDay } from 'date-fns';

// const StatusCard = ({ label, icon, count, color, bgColor }) => (
//   <div className={`${bgColor} ${color} p-4 rounded-xl shadow-sm border border-white/20`}>
//     <div className="flex items-center justify-between">
//       <div>
//         <p className="text-sm font-medium opacity-80">{label}</p>
//         <p className="text-2xl font-bold mt-1">{count}</p>
//       </div>
//       <div className="text-3xl">{icon}</div>
//     </div>
//   </div>
// );

// const RoomStatusLegend = ({ rooms, reservations }) => {
//   // Calculate actual counts for each status
//   const statusCounts = useMemo(() => {
//     const counts = {
//       Available: 0,
//       Occupied: 0,
//       Reserved: 0,
//       Cleaning: 0,
//       'Out of Order': 0
//     };

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     rooms.forEach(room => {
//       room.roomUnits?.forEach(unit => {
//         let isOccupied = false;
//         let isReserved = false;

//         // Check reservations for this unit
//         reservations.forEach(resv => {
//           try {
//             const checkIn = new Date(resv.checkIn);
//             const checkOut = new Date(resv.checkOut);
//             checkIn.setHours(0, 0, 0, 0);
//             checkOut.setHours(0, 0, 0, 0);

//             // Check if today is during the stay
//             if (today >= checkIn && today < checkOut) {
//               if ((resv.roomUnitId === unit.id) || 
//                   (resv.roomNo === unit.roomNumber) || 
//                   (resv.roomNumber === unit.roomNumber)) {
//                 isOccupied = true;
//               }
//             }
//             // Check if today is the checkout day (needs cleaning)
//             else if (isSameDay(today, checkOut)) {
//               if ((resv.roomUnitId === unit.id) || 
//                   (resv.roomNo === unit.roomNumber) || 
//                   (resv.roomNumber === unit.roomNumber)) {
//                 counts['Cleaning']++;
//               }
//             }
//             // Check future reservations
//             else if (today < checkIn) {
//               if ((resv.roomUnitId === unit.id) || 
//                   (resv.roomNo === unit.roomNumber) || 
//                   (resv.roomNumber === unit.roomNumber)) {
//                 isReserved = true;
//               }
//             }
//           } catch (error) {
//             console.error('Error processing reservation:', error);
//           }
//         });

//         if (isOccupied) {
//           counts['Occupied']++;
//         } else if (isReserved) {
//           counts['Reserved']++;
//         } else if (unit.status === 'Out of Order') {
//           counts['Out of Order']++;
//         } else {
//           counts['Available']++;
//         }
//       });
//     });

//     return counts;
//   }, [rooms, reservations]);

//   const statuses = [
//     { label: "Available", icon: "🟢", color: "text-emerald-700", bgColor: "bg-emerald-50" },
//     { label: "Occupied", icon: "🔴", color: "text-red-700", bgColor: "bg-red-50" },
//     { label: "Reserved", icon: "🟡", color: "text-amber-700", bgColor: "bg-amber-50" },
//     { label: "Cleaning", icon: "🧹", color: "text-blue-700", bgColor: "bg-blue-50" },
//     { label: "Out of Order", icon: "🚧", color: "text-gray-700", bgColor: "bg-gray-50" },
//   ];

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
//       {statuses.map(({ label, icon, color, bgColor }) => (
//         <StatusCard
//           key={label}
//           label={label}
//           icon={icon}
//           count={statusCounts[label] || 0}
//           color={color}
//           bgColor={bgColor}
//         />
//       ))}
//     </div>
//   );
// };

// const ModernRoomRow = ({ room, unit, reservations, startDate, visibleDays, showRoomName }) => {
//   const dates = Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i));
  
//   const getStatusForDate = (date) => {
//     const day = new Date(date);
//     day.setHours(0, 0, 0, 0);
    
//     // Check if unit is out of order first
//     if (unit.status === 'Out of Order') return 'Out of Order';
    
//     // Check if this date is a checkout date (needs cleaning)
//     const checkoutReservation = reservations.find((resv) => {
//       const matches = resv.roomUnitId === unit.id || resv.roomNo === unit.roomNumber || resv.roomNumber === unit.roomNumber;
//       if (!matches) return false;

//       try {
//         const checkOutDate = new Date(resv.checkOut);
//         checkOutDate.setHours(0, 0, 0, 0);
//         return isSameDay(day, checkOutDate);
//       } catch (error) {
//         return false;
//       }
//     });

//     if (checkoutReservation) return 'Cleaning';
    
//     // Check if this date is during an active reservation
//     const activeReservation = reservations.find((resv) => {
//       const matches = resv.roomUnitId === unit.id || resv.roomNo === unit.roomNumber || resv.roomNumber === unit.roomNumber;
//       if (!matches) return false;

//       try {
//         const checkInDate = new Date(resv.checkIn);
//         const checkOutDate = new Date(resv.checkOut);
//         checkInDate.setHours(0, 0, 0, 0);
//         checkOutDate.setHours(0, 0, 0, 0);
        
//         return day >= checkInDate && day < checkOutDate;
//       } catch (error) {
//         return false;
//       }
//     });
  
//     if (activeReservation) return 'Occupied';
    
//     // Check for future reservations
//     const futureReservation = reservations.find((resv) => {
//       const matches = resv.roomUnitId === unit.id || resv.roomNo === unit.roomNumber || resv.roomNumber === unit.roomNumber;
//       if (!matches) return false;

//       try {
//         const checkInDate = new Date(resv.checkIn);
//         checkInDate.setHours(0, 0, 0, 0);
//         return isSameDay(day, checkInDate);
//       } catch (error) {
//         return false;
//       }
//     });
    
//     if (futureReservation) return 'Reserved';
    
//     return 'Available';
//   };
  
//   const getStatusStyle = (status) => {
//     const styles = {
//       Available: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200',
//       Occupied: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
//       Reserved: 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200',
//       Cleaning: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200',
//       'Out of Order': 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200',
//     };
//     return styles[status] || styles.Available;
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       Available: '🟢',
//       Occupied: '🔴',
//       Reserved: '🟡',
//       Cleaning: '🧹',
//       'Out of Order': '🚧',
//     };
//     return icons[status] || '🟢';
//   };

//   return (
//     <div className="group hover:bg-gray-50/50 transition-colors duration-200">
//       <div className="flex items-center border-b border-gray-100">
//         <div className="w-40 p-3 flex items-center border-r border-gray-100">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//               <span className="text-white text-sm font-bold">
//                 {showRoomName ? room.name?.charAt(0) || 'R' : ''}
//               </span>
//             </div>
//             <span className="font-medium text-gray-700 truncate">
//               {showRoomName ? room.name : ''}
//             </span>
//           </div>
//         </div>
        
//         <div className="w-28 p-3 border-r border-gray-100">
//           <div className="flex items-center space-x-2">
//             <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
//               <span className="text-xs font-medium text-gray-600">{unit.roomNumber}</span>
//             </div>
//             <span className="font-semibold text-gray-800">{unit.roomNumber}</span>
//           </div>
//         </div>
        
//         <div className="flex-1 flex">
//           {dates.map((date, idx) => {
//             const status = getStatusForDate(date);
//             const isTodayDate = isToday(date);
            
//             return (
//               <div
//                 key={idx}
//                 className={`flex-1 p-2 border-r border-gray-100 last:border-r-0 transition-all duration-200 ${
//                   isTodayDate ? 'bg-blue-50 ring-1 ring-blue-200' : ''
//                 }`}
//               >
//                 <div className="flex flex-col items-center space-y-1">
//                   <div
//                     className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${getStatusStyle(status)}`}
//                     title={`${format(date, 'EEE, MMM dd yyyy')}\nStatus: ${status}`}
//                   >
//                     <span className="text-lg">{getStatusIcon(status)}</span>
//                   </div>
//                   {isTodayDate && (
//                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// const StayView = () => {
//   const [rooms, setRooms] = useState([]);
//   const [reservations, setReservations] = useState([]);
//   const [startDate, setStartDate] = useState(new Date());
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('All');
//   const visibleDays = 7;

//   useEffect(() => {
//     fetchRoomsAndReservations();
//   }, [startDate]);

//   const fetchRoomsAndReservations = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       if (!token) throw new Error('Token not found');

//       const [roomsRes, reservationsRes] = await Promise.all([
//         fetch('http://localhost:5000/api/hotel/rooms-with-units', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//         fetch('http://localhost:5000/api/hotel/getreservations', {
//           headers: { Authorization: `Bearer ${token}` },
//         }),
//       ]);

//       const roomsJson = await roomsRes.json();
//       const reservationsJson = await reservationsRes.json();

//       const fetchedRooms = roomsJson?.rooms || roomsJson || [];
//       const fetchedReservations = reservationsJson?.data || reservationsJson?.reservations || [];

//       setRooms(fetchedRooms);
//       setReservations(fetchedReservations);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredRooms = useMemo(() => {
//     if (!rooms.length) return [];

//     return rooms.filter(room => {
//       // Search term filter
//       const matchesSearch = 
//         room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         room.roomUnits?.some(unit => unit.roomNumber.toString().includes(searchTerm));

//       // Status filter
//       const matchesStatus = filterStatus === 'All' || 
//         room.roomUnits?.some(unit => {
//           if (filterStatus === 'Available') {
//             return unit.status !== 'Out of Order' && 
//               !reservations.some(resv => {
//                 const today = new Date();
//                 today.setHours(0, 0, 0, 0);
//                 try {
//                   const checkIn = new Date(resv.checkIn);
//                   const checkOut = new Date(resv.checkOut);
//                   checkIn.setHours(0, 0, 0, 0);
//                   checkOut.setHours(0, 0, 0, 0);
//                   return (resv.roomUnitId === unit.id || 
//                          resv.roomNo === unit.roomNumber || 
//                          resv.roomNumber === unit.roomNumber) &&
//                          today >= checkIn && today < checkOut;
//                 } catch {
//                   return false;
//                 }
//               });
//           } else if (filterStatus === 'Occupied') {
//             return reservations.some(resv => {
//               const today = new Date();
//               today.setHours(0, 0, 0, 0);
//               try {
//                 const checkIn = new Date(resv.checkIn);
//                 const checkOut = new Date(resv.checkOut);
//                 checkIn.setHours(0, 0, 0, 0);
//                 checkOut.setHours(0, 0, 0, 0);
//                 return (resv.roomUnitId === unit.id || 
//                        resv.roomNo === unit.roomNumber || 
//                        resv.roomNumber === unit.roomNumber) &&
//                        today >= checkIn && today < checkOut;
//               } catch {
//                 return false;
//               }
//             });
//           } else if (filterStatus === 'Out of Order') {
//             return unit.status === 'Out of Order';
//           }
//           return true;
//         });

//       return matchesSearch && matchesStatus;
//     });
//   }, [rooms, reservations, searchTerm, filterStatus]);

//   const navigateWeek = (direction) => {
//     setStartDate(prev => direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7));
//   };

//   const goToToday = () => {
//     setStartDate(new Date());
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading your stay view...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Stay View</h1>
//               <p className="text-gray-600 text-sm md:text-base">Manage your property availability and reservations</p>
//             </div>
//             <div className="flex items-center gap-2">
//               <button 
//                 onClick={() => setFilterStatus('All')}
//                 className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
//                   filterStatus === 'All' 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-white border border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 All
//               </button>
//               <button 
//                 onClick={() => setFilterStatus('Available')}
//                 className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
//                   filterStatus === 'Available' 
//                     ? 'bg-emerald-500 text-white' 
//                     : 'bg-white border border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 <span>🟢</span>
//                 Available
//               </button>
//               <button 
//                 onClick={() => setFilterStatus('Occupied')}
//                 className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
//                   filterStatus === 'Occupied' 
//                     ? 'bg-red-500 text-white' 
//                     : 'bg-white border border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 <span>🔴</span>
//                 Occupied
//               </button>
//               <button 
//                 onClick={() => setFilterStatus('Out of Order')}
//                 className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
//                   filterStatus === 'Out of Order' 
//                     ? 'bg-gray-500 text-white' 
//                     : 'bg-white border border-gray-200 hover:bg-gray-50'
//                 }`}
//               >
//                 <span>🚧</span>
//                 Out of Order
//               </button>
//             </div>
//           </div>

//           {/* Status Overview */}
//           <RoomStatusLegend rooms={rooms} reservations={reservations} />

//           {/* Search and Navigation */}
//           <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 mb-6">
//             <div className="w-full md:w-auto flex items-center gap-2">
//               <div className="relative flex-1 md:w-64">
//                 <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
//                 <input
//                   type="text"
//                   placeholder="Search rooms..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <button
//                 onClick={goToToday}
//                 className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap"
//               >
//                 <span>📅</span>
//                 <span className="hidden md:inline">Today</span>
//               </button>
//             </div>

//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => navigateWeek('prev')}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <span className="text-lg">◀</span>
//               </button>
//               <div className="text-base md:text-lg font-semibold text-gray-800 min-w-[180px] md:min-w-[200px] text-center">
//                 {format(startDate, 'MMM dd')} - {format(addDays(startDate, visibleDays - 1), 'MMM dd, yyyy')}
//               </div>
//               <button
//                 onClick={() => navigateWeek('next')}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <span className="text-lg">▶</span>
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Calendar Grid */}
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           {/* Header Row */}
//           <div className="bg-gray-50 border-b border-gray-200">
//             <div className="flex items-center">
//               <div className="w-40 p-3 border-r border-gray-200">
//                 <span className="font-semibold text-gray-700">Room Type</span>
//               </div>
//               <div className="w-28 p-3 border-r border-gray-200">
//                 <span className="font-semibold text-gray-700">Room #</span>
//               </div>
//               <div className="flex-1 flex">
//                 {Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i)).map((date, idx) => {
//                   const isTodayDate = isToday(date);
//                   return (
//                     <div
//                       key={idx}
//                       className={`flex-1 p-2 border-r border-gray-200 last:border-r-0 text-center ${
//                         isTodayDate ? 'bg-blue-50 text-blue-700 font-semibold' : ''
//                       }`}
//                     >
//                       <div className="text-xs md:text-sm font-medium">{format(date, 'EEE')}</div>
//                       <div className="text-base md:text-lg font-bold mt-1">{format(date, 'dd')}</div>
//                       <div className="text-xs text-gray-500 hidden md:block">{format(date, 'MMM')}</div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>

//           {/* Room Rows */}
//           <div className="divide-y divide-gray-100">
//             {filteredRooms.length > 0 ? (
//               filteredRooms.map((room) =>
//                 room.roomUnits?.map((unit, index) => (
//                   <ModernRoomRow
//                     key={unit.id}
//                     room={room}
//                     unit={unit}
//                     reservations={reservations}
//                     startDate={startDate}
//                     visibleDays={visibleDays}
//                     showRoomName={index === 0}
//                   />
//                 ))
//               )
//             ) : (
//               <div className="p-8 text-center text-gray-500">
//                 <div className="text-4xl mb-4">🏨</div>
//                 <p className="text-lg font-medium mb-2">No rooms found</p>
//                 <p className="text-sm">Try adjusting your search or filters</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StayView;

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

      console.log("Fetched room types:", fetchedRooms.map(r => ({
        name: r.name,
        unitNumbers: r.roomUnits.map(u => u.roomNumber)
      })));
      
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
      console.log('🟢 WebSocket connected');
      if (hotelId) socket.emit('join-hotel', hotelId);
    });

    socket.on('reservation-update', () => {
      fetchRoomsAndReservations();
    });

    socket.on('room-status-update', () => {
      fetchRoomsAndReservations();
    });

    socket.on('disconnect', () => {
      console.log('🔴 WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredRooms = useMemo(() => {
    if (!rooms.length) return [];
  
    return rooms.filter(room => {
      // 🔍 Search check (by room name or room number)
      const matchesSearch =
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomUnits?.some(unit => unit.roomNumber.toString().includes(searchTerm));
  
      // 🎯 Filter Status check
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
  
        if (filterStatus === 'Available') {
          return !isOccupied && !isOutOfOrder;
        }
        if (filterStatus === 'Occupied') {
          return isOccupied;
        }
        if (filterStatus === 'Out of Order') {
          return isOutOfOrder;
        }
  
        return true;
      });
      console.log('🧠 Filtered room:', room.name, '| matchesSearch:', matchesSearch, '| matchesStatus:', matchesStatus);

      return matchesSearch && matchesStatus;
    });
  }, [rooms, reservations, searchTerm, filterStatus]);
  
  const navigateWeek = (direction) => {
    setStartDate((prev) =>
      direction === 'prev' ? subDays(prev, 7) : addDays(prev, 7)
    );
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your stay view...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Stay View</h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage your property availability and reservations
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['All', 'Available', 'Occupied', 'Out of Order'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 text-sm ${
                    filterStatus === status
                      ? status === 'Available'
                        ? 'bg-emerald-500 text-white'
                        : status === 'Occupied'
                        ? 'bg-red-500 text-white'
                        : status === 'Out of Order'
                        ? 'bg-gray-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status === 'Available'
                    ? '🟢'
                    : status === 'Occupied'
                    ? '🔴'
                    : status === 'Out of Order'
                    ? '🚧'
                    : ''}
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-200 mb-6">
            <div className="w-full md:w-auto flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">🔍</span>
                <input
                  type="text"
                  placeholder="Search rooms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={goToToday}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>📅</span>
                <span className="hidden md:inline">Today</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ◀
              </button>
              <div className="text-base md:text-lg font-semibold text-gray-800 min-w-[180px] md:min-w-[200px] text-center">
                {format(startDate, 'MMM dd')} -{' '}
                {format(addDays(startDate, visibleDays - 1), 'MMM dd, yyyy')}
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ▶
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-40 p-3 border-r border-gray-200">
                <span className="font-semibold text-gray-700">Room Type</span>
              </div>
              <div className="w-28 p-3 border-r border-gray-200">
                <span className="font-semibold text-gray-700">Room #</span>
              </div>
              <div className="flex-1 flex">
                {Array.from({ length: visibleDays }, (_, i) => addDays(startDate, i)).map(
                  (date, idx) => (
                    <div
                      key={idx}
                      className={`flex-1 p-2 border-r border-gray-200 last:border-r-0 text-center ${
                        isToday(date) ? 'bg-blue-50 text-blue-700 font-semibold' : ''
                      }`}
                    >
                      <div className="text-xs md:text-sm font-medium">{format(date, 'EEE')}</div>
                      <div className="text-base md:text-lg font-bold mt-1">{format(date, 'dd')}</div>
                      <div className="text-xs text-gray-500 hidden md:block">
                        {format(date, 'MMM')}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          

          <div className="divide-y divide-gray-100">
          {console.log("🔄 Rendering RoomRows for filteredRooms:", filteredRooms.map(r => ({
    name: r.name,
    unitCount: r.roomUnits?.length,
    unitNumbers: r.roomUnits?.map(u => u.roomNumber)
  })))}
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
                <div className="text-4xl mb-4">🏨</div>
                <p className="text-lg font-medium mb-2">No rooms found</p>
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
