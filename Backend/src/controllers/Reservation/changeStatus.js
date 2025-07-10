// src/controllers/UpdateStatus.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateRoomUnitStatus = async () => {
  try {
    const now = new Date();
    console.log(`Starting room unit status update at ${now.toISOString()}`);

    // Verify Prisma client connection
    await prisma.$connect();

    // Get all active reservations (both regular and maintenance)
    const activeReservations = await prisma.reservation.findMany({
      where: {
        checkIn: { lte: now },
        checkOut: { gt: now },
        roomUnitId: { not: null },
      },
      select: {
        roomUnitId: true,
        isMaintenance: true,
      },
    });

    // Separate room unit IDs by status
    const bookedRoomUnitIds = [];
    const maintenanceRoomUnitIds = [];

    activeReservations.forEach(res => {
      if (res.isMaintenance) {
        maintenanceRoomUnitIds.push(res.roomUnitId);
      } else {
        bookedRoomUnitIds.push(res.roomUnitId);
      }
    });

    // Batch update operations
    const updatePromises = [];

    // Update BOOKED rooms if any
    if (bookedRoomUnitIds.length > 0) {
      updatePromises.push(
        prisma.roomUnit.updateMany({
          where: { id: { in: bookedRoomUnitIds } },
          data: { status: 'BOOKED' },
        })
      );
      console.log(`Marking ${bookedRoomUnitIds.length} rooms as BOOKED`);
    }

    // Update MAINTENANCE rooms if any
    if (maintenanceRoomUnitIds.length > 0) {
      updatePromises.push(
        prisma.roomUnit.updateMany({
          where: { id: { in: maintenanceRoomUnitIds } },
          data: { status: 'MAINTENANCE' },
        })
      );
      console.log(`Marking ${maintenanceRoomUnitIds.length} rooms as MAINTENANCE`);
    }

    // Update AVAILABLE rooms (only those needing change)
    updatePromises.push(
      prisma.roomUnit.updateMany({
        where: {
          id: { notIn: [...bookedRoomUnitIds, ...maintenanceRoomUnitIds] },
          status: { not: 'AVAILABLE' },
        },
        data: { status: 'AVAILABLE' },
      })
    );

    // Execute all updates in parallel
    await Promise.all(updatePromises);

    console.log('✅ Room unit status update completed successfully');
    return true;
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