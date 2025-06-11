// src/controllers/roomUnitController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getAllRoomUnits = async (req, res) => {
  try {
    const roomUnits = await prisma.roomUnit.findMany({
      include: {
        room: true // Include all room details
      },
      orderBy: [
        { floor: 'asc' },
        { roomNumber: 'asc' }
      ]
    });

    res.json(roomUnits);
  } catch (error) {
    console.error("Failed to fetch room units:", error);
    res.status(500).json({ 
      error: "Internal server error while fetching room units." 
    });
  }
};