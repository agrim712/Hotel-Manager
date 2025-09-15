import schedule from 'node-schedule';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { emitRoomStatusUpdate } from '../utils/socketEmitters.js';

const prisma = new PrismaClient();
const scheduledJobs = new Map();

export const scheduleCheckoutJob = (reservation, io) => {
  const { id, checkOut, roomUnitId } = reservation;
  if (!roomUnitId || !checkOut) return;

  // Cancel existing job if any
  if (scheduledJobs.has(id)) {
    scheduledJobs.get(id).cancel();
    scheduledJobs.delete(id);
  }

  const job = schedule.scheduleJob(new Date(checkOut), async () => {
    console.log(`🔔 Checkout for reservation ${id} triggered`);

    try {
      const updatedRoom = await prisma.roomUnit.update({
        where: { id: roomUnitId },
        data: {
          status: 'AVAILABLE',
          cleaningStatus: 'NEEDS_CLEANING'
        },
        include: { hotel: { select: { id: true } } }
      });

      emitRoomStatusUpdate(io, updatedRoom.hotel.id, updatedRoom);
    } catch (err) {
      console.error(`❌ Failed to update room for reservation ${id}`, err);
    } finally {
      scheduledJobs.delete(id);
    }
  });

  scheduledJobs.set(id, job);
};

export const cancelCheckoutJob = (reservationId) => {
  if (scheduledJobs.has(reservationId)) {
    scheduledJobs.get(reservationId).cancel();
    scheduledJobs.delete(reservationId);
  }
};

// On startup, reschedule all future checkouts
export const initCheckoutJobs = async (io) => {
  const futureReservations = await prisma.reservation.findMany({
    where: { checkOut: { gt: new Date() }, roomUnitId: { not: null } }
  });
  futureReservations.forEach(res => scheduleCheckoutJob(res, io));
};
