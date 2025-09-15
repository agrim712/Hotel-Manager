// src/controllers/roomCountController.js
import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


export const getRoomCounts = async (req, res) => {
  const { hotelId } = req.user;

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId from token." });
  }

  try {
    // Get all rooms for the hotel with their counts
    const rooms = await prisma.room.findMany({
      where: {
        hotelId,
      },
      select: {
        id: true,
        name: true,
        rateType: true,
        numOfRooms: true,
        roomNumbers: true,
      },
    });

    // If no rooms found
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found for this hotel." });
    }

    // Transform the data to include both counts and room numbers
    const roomCounts = rooms.map(room => ({
      roomId: room.id,
      roomType: room.name,
      rateType: room.rateType,
      totalRooms: room.numOfRooms,
      roomNumbers: room.roomNumbers,
    }));

    return res.json({ roomCounts });
  } catch (error) {
    console.error("Error fetching room counts:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};