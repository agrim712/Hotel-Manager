// src/controllers/availableRoomsController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// src/controllers/roomController.js

export const getAvailableRoomNumbers = async (req, res) => {
  const {hotelId} = req.user;
  try {
    const { checkInDate, checkOutDate, roomType, rateType } = req.query;

    // Step 1: Get all RoomUnits matching roomType and rateType
    const roomUnits = await prisma.roomUnit.findMany({
  where: {
    room: {
      hotelId: hotelId,
      name: roomType,     // if you're matching by Room.name, not RoomType (adjust this!)
      rateType: rateType,
    },
  },
      select: {
        id: true,
        roomNumber: true,
      },
    });

    const roomUnitIds = roomUnits.map((room) => room.id);

    if (roomUnitIds.length === 0) {
      return res.status(200).json({ availableRooms: [] });
    }

    // Step 2: Find reservations that overlap with the date range
    const conflictingReservations = await prisma.reservation.findMany({
      where: {
        roomUnitId: {
          in: roomUnitIds,
        },
        state: {
          notIn: ['CANCELLED', 'NO_SHOW'],
        },
        OR: [
          {
            checkIn: {
              lt: new Date(checkOutDate),
            },
            checkOut: {
              gt: new Date(checkInDate),
            },
          },
        ],
      },
      select: {
        roomUnitId: true,
      },
    });

    const bookedRoomIds = conflictingReservations.map((r) => r.roomUnitId);

    // Step 3: Filter out booked rooms
    const availableRooms = roomUnits.filter(
      (room) => !bookedRoomIds.includes(room.id)
    );

    res.status(200).json({
  success: true,
  rooms: availableRooms.map((room) => ({
    id: room.id,
    number: room.roomNumber, // ✅ match frontend
  })),
});
  } catch (error) {
    console.error('Error in getAvailableRoomNumbers:', error);
    res.status(500).json({ success: false, message: 'Internal server error.', error: error.message });
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