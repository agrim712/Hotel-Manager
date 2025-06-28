// src/controllers/UpdateStatus.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const updateRoomUnitStatus = async () => {
  try {
    const now = new Date();

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

    const bookedRoomUnitIds = activeReservations
      .filter(res => !res.isMaintenance)
      .map(res => res.roomUnitId);

    const maintenanceRoomUnitIds = activeReservations
      .filter(res => res.isMaintenance)
      .map(res => res.roomUnitId);

    // Update BOOKED rooms
    if (bookedRoomUnitIds.length > 0) {
      await prisma.roomUnit.updateMany({
        where: {
          id: { in: bookedRoomUnitIds },
        },
        data: {
          status: 'BOOKED',
        },
      });
    }

    // Update MAINTENANCE rooms
    if (maintenanceRoomUnitIds.length > 0) {
      await prisma.roomUnit.updateMany({
        where: {
          id: { in: maintenanceRoomUnitIds },
        },
        data: {
          status: 'MAINTENANCE',
        },
      });
    }

    // Reset others to AVAILABLE (only those not in either active set)
    await prisma.roomUnit.updateMany({
      where: {
        id: { notIn: [...bookedRoomUnitIds, ...maintenanceRoomUnitIds] },
        status: { not: 'AVAILABLE' },
      },
      data: {
        status: 'AVAILABLE',
      },
    });

    console.log(`✅ Room unit statuses updated at ${now.toLocaleString()}`);
  } catch (error) {
    console.error("❌ Error updating room status:", error);
  } finally {
    await prisma.$disconnect();
  }
};