// src/utils/socketEmitters.js
export const emitReservationUpdate = (io, hotelId, eventType, data) => {
  const event = { type: eventType, timestamp: new Date().toISOString(), data };
  const room = `hotel_${hotelId}`;
  io.to(room).emit('reservation-update', event);
  console.log(`WebSocket: Emitted ${eventType} to ${room}`);
};

export const emitRoomStatusUpdate = (io, hotelId, roomData) => {
  const event = { type: 'room-status-update', timestamp: new Date().toISOString(), data: roomData };
  const room = `hotel_${hotelId}`;
  io.to(room).emit('room-status-update', event);
  console.log(`WebSocket: Emitted room-status-update to ${room}`);
};

// convenience event for single-room updated (cleaning status)
export const emitRoomCleaningStatusUpdated = (io, hotelId, updatedRoom) => {
  const payload = { type: 'room-cleaning-updated', timestamp: new Date().toISOString(), data: updatedRoom };
  io.to(`hotel_${hotelId}`).emit('roomCleaningStatusUpdated', payload);
  console.log(`WebSocket: Emitted roomCleaningStatusUpdated to hotel_${hotelId}`, updatedRoom.id);
};
