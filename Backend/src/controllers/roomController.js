// src/controllers/roomController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getRoomsWithUnits = async (req, res) => {
  const { hotelId } = req.user;

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId from token." });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        roomUnits: true, // Include room unit details (room numbers etc.)
      },
    });
    res.json(rooms);
  } catch (error) {
    console.error('Failed to fetch rooms with units:', error);
    res.status(500).json({ error: 'Internal server error while fetching rooms.' });
  }
};
