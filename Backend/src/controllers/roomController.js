// src/controllers/roomController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();





export const getAvailableRoomNumbers = async (req, res) => {
  try {
    const { roomType, rateType, checkInDate, checkOutDate } = req.query;
    const hotelId = req.user?.hotelId;

    // Input validation
    if (!hotelId) {
      return res.status(400).json({
        success: false,
        message: "Authentication error: Missing hotelId"
      });
    }

    if (!roomType || !checkInDate || !checkOutDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters: roomType, checkInDate, or checkOutDate"
      });
    }

    // Date validation
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (!(checkIn instanceof Date) || isNaN(checkIn.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkInDate format - must be ISO 8601 format"
      });
    }

    if (!(checkOut instanceof Date) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid checkOutDate format - must be ISO 8601 format"
      });
    }

    // Business logic validation
    const now = new Date();
    if (checkIn < now) {
      return res.status(400).json({
        success: false,
        message: "Check-in date must be in the future"
      });
    }

    if (checkOut <= checkIn) {
      return res.status(400).json({
        success: false,
        message: "Check-out date must be after check-in date"
      });
    }

    // Find available rooms
    const roomUnits = await prisma.roomUnit.findMany({
      where: {
        room: {
          hotelId,
          name: roomType,
          ...(rateType && { rateType }) // Optional rateType filter
        }
      },
      include: {
        room: {
          select: {
            name: true,
            rateType: true,
            maxGuests: true
          }
        }
      }
    });

    if (roomUnits.length === 0) {
      return res.json({
        success: true,
        availableRooms: [],
        message: "No rooms found matching criteria"
      });
    }

    // Find overlapping reservations
    const overlappingReservations = await prisma.reservation.findMany({
      where: {
        hotelId,
        roomUnitId: {
          in: roomUnits.map(unit => unit.id)
        },
        OR: [
          {
            checkIn: { lt: checkOut },
            checkOut: { gt: checkIn }
          }
        ],
        status: {
          not: 'CANCELLED'
        }
      },
      select: {
        roomUnitId: true
      }
    });

    const bookedUnitIds = new Set(overlappingReservations.map(r => r.roomUnitId));

    // Filter available units and format response
    const availableRooms = roomUnits
      .filter(unit => !bookedUnitIds.has(unit.id))
      .map(unit => ({
        number: unit.roomNumber,
        type: unit.room.name,
        rateType: unit.room.rateType,
        maxGuests: unit.room.maxGuests
      }));

    return res.json({
      success: true,
      availableRooms,
      count: availableRooms.length,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString()
    });

  } catch (error) {
    console.error("Error in getAvailableRoomNumbers:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getRoomsWithUnits = async (req, res) => {
  const { hotelId } = req.user;

  if (!hotelId) {
    return res.status(400).json({ 
      success: false,
      error: "Missing hotelId from token." 
    });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        roomUnits: {
          select: {
            id: true,
            roomNumber: true,
            status: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return res.json({
      success: true,
      count: rooms.length,
      rooms
    });

  } catch (error) {
    console.error('Failed to fetch rooms with units:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching rooms.',
      details: error.message
    });
  }
};