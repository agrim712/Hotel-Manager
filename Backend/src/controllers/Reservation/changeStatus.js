// src/controllers/UpdateStatus.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const updateRoomUnitStatus = async () => {
  try {
    const now = new Date();

    const reservations = await prisma.reservation.findMany({
      where: {
        checkIn: { lte: now },
        checkOut: { gt: now },
        roomUnitId: { not: null },
      },
      select: {
        roomUnitId: true,
      },
    });

    const bookedRoomUnitIds = reservations.map(res => res.roomUnitId);

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

    // Reset others to AVAILABLE
    await prisma.roomUnit.updateMany({
      where: {
        id: { notIn: bookedRoomUnitIds },
        status: 'BOOKED',
      },
      data: {
        status: 'AVAILABLE',
      },
    });

    console.log(`✅ Room unit statuses updated at ${now.toLocaleString()}`);
  } catch (error) {
    console.error("❌ Error updating room status:", error);
  } finally {
    await prisma.$disconnect(); // Disconnect to avoid leaking connections
  }
};
