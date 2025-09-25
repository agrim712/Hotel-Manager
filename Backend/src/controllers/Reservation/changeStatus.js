// src/controllers/Reservation/changeStatus.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

/**
 * Calculate the day index from a start date
 * @param {Date} startDate - The reference start date
 * @param {Date} targetDate - The date to calculate index for
 * @returns {number} - Day index (0-based)
 */
function calculateDayIndex(startDate, targetDate) {
  const diffTime = targetDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays); // Ensure non-negative
}

/**
 * Update the dailyStatus array for a specific date
 * @param {string[]} dailyStatus - Current daily status array
 * @param {number} dayIndex - Index to update
 * @param {string} status - New status ('AVAILABLE', 'BOOKED', 'MAINTENANCE')
 * @returns {string[]} - Updated daily status array
 */
function updateDailyStatus(dailyStatus, dayIndex, status) {
  const updated = [...dailyStatus];
  
  // Extend array if needed
  while (updated.length <= dayIndex) {
    updated.push('AVAILABLE');
  }
  
  updated[dayIndex] = status;
  return updated;
}

export const updateRoomUnitStatus = async (io) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Start of today
    console.log(`🔄 Starting room unit status update at ${now.toISOString()}`);

    // Verify Prisma client connection
    await prisma.$connect();

    // Get all room units with their current dailyStatus
    const roomUnits = await prisma.roomUnit.findMany({
      select: {
        id: true,
        roomNumber: true,
        startDate: true,
        dailyStatus: true,
        hotelId: true,
        room: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`📋 Processing ${roomUnits.length} room units`);

    // Get all active reservations for today and future dates
    const activeReservations = await prisma.reservation.findMany({
      where: {
        checkIn: { lte: today },
        checkOut: { gt: today },
        roomUnitId: { not: null },
      },
      select: {
        roomUnitId: true,
        checkIn: true,
        checkOut: true,
        isMaintenance: true,
      },
    });

    console.log(`📅 Found ${activeReservations.length} active reservations`);

    // Create a map of room unit updates
    const roomUnitUpdates = new Map();

    // Initialize all room units for today as AVAILABLE
    roomUnits.forEach(roomUnit => {
      const dayIndex = calculateDayIndex(roomUnit.startDate, today);
      const updatedStatus = updateDailyStatus(roomUnit.dailyStatus, dayIndex, 'AVAILABLE');
      
      roomUnitUpdates.set(roomUnit.id, {
        dailyStatus: updatedStatus,
        roomNumber: roomUnit.roomNumber,
        roomName: roomUnit.room.name,
        hotelId: roomUnit.hotelId,
      });
    });

    // Process active reservations
    let bookedCount = 0;
    let maintenanceCount = 0;

    activeReservations.forEach(reservation => {
      const roomUnit = roomUnits.find(ru => ru.id === reservation.roomUnitId);
      if (!roomUnit) {
        console.warn(`⚠️ Room unit ${reservation.roomUnitId} not found`);
        return;
      }

      // Calculate day index for today
      const dayIndex = calculateDayIndex(roomUnit.startDate, today);
      
      // Get current update for this room unit
      const currentUpdate = roomUnitUpdates.get(reservation.roomUnitId);
      
      if (reservation.isMaintenance) {
        const updatedStatus = updateDailyStatus(
          currentUpdate.dailyStatus, 
          dayIndex, 
          'MAINTENANCE'
        );
        roomUnitUpdates.set(reservation.roomUnitId, {
          ...currentUpdate,
          dailyStatus: updatedStatus,
        });
        maintenanceCount++;
      } else {
        const updatedStatus = updateDailyStatus(
          currentUpdate.dailyStatus, 
          dayIndex, 
          'BOOKED'
        );
        roomUnitUpdates.set(reservation.roomUnitId, {
          ...currentUpdate,
          dailyStatus: updatedStatus,
        });
        bookedCount++;
      }
    });

    // Execute batch updates
    const updatePromises = [];
    const websocketUpdates = [];

    for (const [roomUnitId, updateData] of roomUnitUpdates) {
      updatePromises.push(
        prisma.roomUnit.update({
          where: { id: roomUnitId },
          data: { dailyStatus: updateData.dailyStatus },
        })
      );

      // Prepare websocket update data
      const todayIndex = calculateDayIndex(
        roomUnits.find(ru => ru.id === roomUnitId)?.startDate || today,
        today
      );
      const todayStatus = updateData.dailyStatus[todayIndex] || 'AVAILABLE';
      
      websocketUpdates.push({
        roomUnitId,
        roomNumber: updateData.roomNumber,
        roomName: updateData.roomName,
        hotelId: updateData.hotelId,
        status: todayStatus,
        date: today.toISOString().split('T')[0],
      });
    }

    // Execute all updates in parallel
    await Promise.all(updatePromises);

    // Emit websocket updates to notify frontend
    if (io && websocketUpdates.length > 0) {
      // Group updates by hotel for efficient broadcasting
      const updatesByHotel = websocketUpdates.reduce((acc, update) => {
        if (!acc[update.hotelId]) acc[update.hotelId] = [];
        acc[update.hotelId].push(update);
        return acc;
      }, {});

      Object.entries(updatesByHotel).forEach(([hotelId, updates]) => {
        io.to(`hotel_${hotelId}`).emit('roomStatusUpdated', {
          type: 'batch_update',
          updates,
          timestamp: now.toISOString(),
        });
      });
    }

    console.log(`✅ Room unit status update completed successfully:`);
    console.log(`   📊 Total rooms processed: ${roomUnits.length}`);
    console.log(`   🏨 Booked rooms: ${bookedCount}`);
    console.log(`   🔧 Maintenance rooms: ${maintenanceCount}`);
    console.log(`   ✨ Available rooms: ${roomUnits.length - bookedCount - maintenanceCount}`);
    
    return {
      success: true,
      processed: roomUnits.length,
      booked: bookedCount,
      maintenance: maintenanceCount,
      available: roomUnits.length - bookedCount - maintenanceCount,
    };
  } catch (error) {
    console.error('❌ Failed to update room unit status:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('❌ Failed to disconnect Prisma client:', disconnectError.message);
    }
  }
};
