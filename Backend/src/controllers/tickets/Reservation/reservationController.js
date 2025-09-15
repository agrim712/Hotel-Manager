// src/controllers/reservationController.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { emitReservationUpdate, emitRoomStatusUpdate } from '../../utils/websocketEvents.js';

const prisma = new PrismaClient();

function parseDateStrict(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

// CREATE RESERVATION
export const createReservation = async (req, res) => {
  try {
    const data = req.body;
    const photoFile = req.file;
    const io = req.app.get('io');
    const hotelId = req.user?.hotelId;

    if (!hotelId) {
      return res.status(401).json({ success: false, message: "Unauthorized: hotelId missing" });
    }

    const checkIn = parseDateStrict(data.checkInDate);
    const checkOut = parseDateStrict(data.checkOutDate);
    const dob = data.dob ? parseDateStrict(data.dob) : null;

    if (!checkIn || !checkOut || checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Invalid check-in or check-out date" });
    }

    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const guests = Number(data.numberOfGuests);
    const rooms = Number(data.numRooms);
    const roomNoArray = typeof data.roomNumbers === 'string'
      ? data.roomNumbers.split(',').map(r => r.trim())
      : data.roomNumbers;

    const perDayRate = parseFloat(data.perDayRate);
    const perDayTax = parseFloat(data.perDayTax);
    const totalAmount = parseFloat(data.totalAmount) || perDayRate * nights * rooms;
    const taxInclusive = data.taxInclusive === 'true' || data.taxInclusive === true;

    if (isNaN(guests) || isNaN(rooms) || isNaN(perDayRate) || isNaN(perDayTax)) {
      return res.status(400).json({ success: false, message: "Invalid numeric values" });
    }

    // Find matching room units
    const possibleRoomUnits = await prisma.roomUnit.findMany({
      where: {
        hotelId,
        OR: roomNoArray.map(roomNo => ({ roomNumber: roomNo }))
      },
      include: { room: true }
    });

    if (!possibleRoomUnits.length) {
      return res.status(400).json({ success: false, message: "No matching room units found" });
    }

    const roomIds = [...new Set(possibleRoomUnits.map(u => u.roomId))];
    const floorRoomNumbers = possibleRoomUnits.map(unit => `${unit.floor}-${unit.roomNumber}`);

    const verifiedRooms = await prisma.room.findMany({
      where: {
        id: { in: roomIds },
        OR: floorRoomNumbers.map(roomNo => ({
          roomNumbers: { has: roomNo }
        }))
      }
    });

    if (!verifiedRooms.length) {
      return res.status(400).json({ success: false, message: "No verified rooms found" });
    }

    const matchingRoomUnits = possibleRoomUnits.filter(u =>
      verifiedRooms.some(r => r.id === u.roomId)
    );

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn,
        checkOut,
        nights,
        roomType: data.roomType,
        rateType: data.rateType,
        guests,
        rooms,
        roomNo: data.roomNumbers,
        bookedBy: data.bookedBy,
        businessSegment: data.businessSegment,
        billTo: data.billTo,
        paymentMode: data.paymentMode,
        perDayRate,
        perDayTax,
        taxInclusive,
        totalAmount,
        guestName: data.guestName,
        email: data.email,
        phone: data.phone,
        dob,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        identity: data.identity,
        idDetail: data.idDetail,
        idProof: data.idProof || null,
        photoIdPath: photoFile ? `/uploads/${photoFile.filename}` : null,
        hotelId,
        roomUnitId: matchingRoomUnits[0]?.id,
        connectedRooms: {
          connect: verifiedRooms.map(r => ({ id: r.id }))
        },
      },
    });

    // Update booked room units
    await prisma.roomUnit.updateMany({
      where: { id: { in: matchingRoomUnits.map(u => u.id) } },
      data: { status: 'BOOKED' }
    });

    // 🔥 Real-time push
    emitReservationUpdate(io, hotelId, 'reservation-created', reservation);
    emitRoomStatusUpdate(io, hotelId, matchingRoomUnits);

    return res.status(201).json({ success: true, data: reservation });

  } catch (err) {
    console.error('❌ Reservation creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// UPDATE RESERVATION
export const updateReservation = async (req, res) => {
  try {
    const io = req.app.get('io');
    const hotelId = req.user?.hotelId;
    const reservationId = req.params.id;
    const updatedData = req.body;

    const existing = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { ...updatedData, updatedAt: new Date() },
    });

    // 🔥 Real-time push
    emitReservationUpdate(io, hotelId, 'reservation-updated', updatedReservation);

    // If room status changed, update room unit status as well
    if (updatedData.status && existing.roomUnitId) {
      await prisma.roomUnit.update({
        where: { id: existing.roomUnitId },
        data: { status: updatedData.status }
      });

      const updatedRoomUnit = await prisma.roomUnit.findUnique({ where: { id: existing.roomUnitId } });
      emitRoomStatusUpdate(io, hotelId, [updatedRoomUnit]);
    }

    return res.json({ success: true, data: updatedReservation });
  } catch (err) {
    console.error('Error updating reservation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE RESERVATION
export const deleteReservation = async (req, res) => {
  try {
    const io = req.app.get('io');
    const hotelId = req.user?.hotelId;
    const { id: reservationId } = req.params;

    const reservation = await prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    await prisma.reservation.delete({ where: { id: reservationId } });

    // Set related room to AVAILABLE
    let updatedRoomUnit = null;
    if (reservation.roomUnitId) {
      updatedRoomUnit = await prisma.roomUnit.update({
        where: { id: reservation.roomUnitId },
        data: { status: 'AVAILABLE' },
      });
    }

    // 🔥 Real-time push
    emitReservationUpdate(io, hotelId, 'reservation-deleted', { id: reservationId });
    if (updatedRoomUnit) {
      emitRoomStatusUpdate(io, hotelId, [updatedRoomUnit]);
    }

    return res.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting reservation' });
  }
};
