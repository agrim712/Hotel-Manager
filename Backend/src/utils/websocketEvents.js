// WebSocket event emitter utility
export const emitReservationUpdate = (io, hotelId, eventType, data) => {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString(),
      data
    };
    
    // Emit to all clients connected to this hotel
    io.to(`hotel_${hotelId}`).emit('reservation-update', event);
    console.log(`WebSocket: Emitted ${eventType} to hotel_${hotelId}`, data);
  };
  
  export const emitRoomStatusUpdate = (io, hotelId, roomData) => {
    const event = {
      type: 'room-status-update',
      timestamp: new Date().toISOString(),
      data: roomData
    };
    
    io.to(`hotel_${hotelId}`).emit('room-status-update', event);
    console.log(`WebSocket: Emitted room status update to hotel_${hotelId}`, roomData);
  };