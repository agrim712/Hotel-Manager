import { PrismaClient } from '@prisma/client';
import { emitReservationUpdate, emitRoomStatusUpdate } from '../../utils/websocketEvents.js';

const prisma = new PrismaClient();

function parseDateStrict(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

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

      console.log(roomNoArray);
    // Convert simple room numbers to floor-room format for matching
    const formattedRoomNumbers = roomNoArray; // No formatting needed

    const perDayRate = parseFloat(data.perDayRate);
    const perDayTax = parseFloat(data.perDayTax);
    const totalAmount = parseFloat(data.totalAmount) || perDayRate * nights * rooms;
    const taxInclusive = data.taxInclusive === 'true' || data.taxInclusive === true;

    if (isNaN(guests) || isNaN(rooms) || isNaN(perDayRate) || isNaN(perDayTax)) {
      return res.status(400).json({ success: false, message: "Invalid numeric values" });
    }
    console.log(formattedRoomNumbers)
    // First find all possible room units that match our numbers
    const possibleRoomUnits = await prisma.roomUnit.findMany({
      where: {
        hotelId,
        OR: formattedRoomNumbers.map(roomNo => ({
          roomNumber: { equals: roomNo }
        }))
      },
      include: {
        room: true
      }
    });

    if (possibleRoomUnits.length === 0) {
      return res.status(400).json({ success: false, message: "No matching room units found" });
    }
    console.log(possibleRoomUnits);
    // Get the actual room IDs from the found units
    const roomIds = [...new Set(possibleRoomUnits.map(u => u.roomId))];

    // Verify these rooms actually contain these room numbers
    // Construct floor-roomNumber format to match roomNumbers in Room model
const floorRoomNumbers = possibleRoomUnits.map(unit => `${unit.floor}-${unit.roomNumber}`);

const verifiedRooms = await prisma.room.findMany({
  where: {
    id: { in: roomIds },
    OR: floorRoomNumbers.map(roomNo => ({
      roomNumbers: { has: roomNo }
    }))
  }
});


    if (verifiedRooms.length === 0) {
      return res.status(400).json({ success: false, message: "No verified rooms found" });
    }

    // Filter room units to only those that are in verified rooms
    const matchingRoomUnits = possibleRoomUnits.filter(u => 
      verifiedRooms.some(r => r.id === u.roomId)
    );

    // Create the reservation
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
          connect: verifiedRooms.map(r => ({ id: r.id })),
        },
      },
    });

    // Update room unit statuses to BOOKED
    await prisma.roomUnit.updateMany({
      where: {
        id: { in: matchingRoomUnits.map(u => u.id) }
      },
      data: {
        status: 'BOOKED'
      }
    });

    // Notify via WebSocket
    emitReservationUpdate(io, hotelId, 'reservation-created', reservation);
    emitRoomStatusUpdate(io, hotelId, matchingRoomUnits);

    return res.status(201).json({ success: true, data: reservation });

  } catch (err) {
    console.error('❌ Reservation creation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const deleteReservation = async (req, res) => {
  try {
    const io = req.app.get('io');
    const hotelId = req.user?.hotelId;
    const { id: reservationId } = req.params;

    // Get reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Delete reservation
    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    // Set related room unit to AVAILABLE
    if (reservation.roomUnitId) {
      await prisma.roomUnit.update({
        where: { id: reservation.roomUnitId },
        data: { status: 'AVAILABLE' },
      });
    }

    emitReservationUpdate(io, hotelId, 'reservation-deleted', { id: reservationId });

    return res.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return res.status(500).json({ success: false, message: 'Server error while deleting reservation' });
  }
};
export const updateReservation = async (req, res) => {
  try {
    const io = req.app.get('io');
    const hotelId = req.user?.hotelId;
    const reservationId = req.params.id;
    const updatedData = req.body;

    const existing = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        ...updatedData,
        updatedAt: new Date(),
      },
    });

    emitReservationUpdate(io, hotelId, 'reservation-updated', updatedReservation);
    return res.json({ success: true, data: updatedReservation });
  } catch (err) {
    console.error('Error updating reservation:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};