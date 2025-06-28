// src/controllers/roomUnitController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// src/controllers/roomUnitController.js
export const getAllRoomUnits = async (req, res) => {
  const { hotelId } = req.user;

  try {
    const roomUnits = await prisma.roomUnit.findMany({
      where: {
        room: {
          hotelId
        },
        ...(req.query.roomType && { room: { name: req.query.roomType } }),
        ...(req.query.rateType && { room: { rateType: req.query.rateType } })
      },
      include: {
        room: {
          select: {
            name: true,
            rateType: true
          }
        }
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' }
      ]
    });

    // Return a flatter structure that matches frontend expectations
    const formattedRooms = roomUnits.map(unit => ({
      id: unit.id,
      roomNumber: unit.roomNumber, // Directly use roomNumber instead of number
      type: unit.room.name,
      rateType: unit.room.rateType,
      status: unit.status
    }));

    res.json(formattedRooms); // Directly return the array without nesting
  } catch (error) {
    console.error('Error fetching room units:', error);
    res.status(500).json({
      error: 'Failed to fetch room units',
      details: error.message
    });
  }
};