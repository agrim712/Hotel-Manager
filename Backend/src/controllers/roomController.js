import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


// src/controllers/roomController.js

export const getAvailableRoomNumbers = async (req, res) => {
  const { hotelId } = req.user;
  try {
    const { checkInDate, checkOutDate, roomType, rateType } = req.query;

    // Step 1: Get all RoomUnits matching roomType and rateType
    const roomUnits = await prisma.roomUnit.findMany({
      where: {
        room: {
          hotelId: hotelId,
          name: roomType,
          rateType: rateType,
        },
        status: "AVAILABLE", // Ensure room is not under maintenance
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
        roomUnitId: { in: roomUnitIds },
        state: { notIn: ['CANCELLED', 'NO_SHOW'] }, // Only exclude cancelled/no-show
        OR: [ // Correct overlap detection
          {
            checkIn: { lt: new Date(checkOutDate) },
            checkOut: { gt: new Date(checkInDate) },
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
        roomNumber: room.roomNumber, // ✅ Correct field name
      })),
    });
  } catch (error) {
    console.error('Error in getAvailableRoomNumbers:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error.', 
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
    const roomUnits = await prisma.roomUnit.findMany({
      where: { hotelId },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        status: true,
        room: true, // ✅ return all fields from the Room table
        cleaningStatus: true
      },
      orderBy: {
        roomNumber: 'asc'
      }
    });

    return res.json({
      success: true,
      count: roomUnits.length,
      rooms: roomUnits
    });

  } catch (error) {
    console.error('Failed to fetch room units with room info:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching room units.',
      details: error.message
    });
  }
};

