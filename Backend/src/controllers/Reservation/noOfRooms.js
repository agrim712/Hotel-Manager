// src/controllers/roomCountController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRoomCount = async (req, res) => {
  const { roomType, rateType } = req.query;
  const { hotelId } = req.user;

  if (!roomType || !rateType) {
    return res.status(400).json({ error: "Missing roomType or rateType in query params." });
  }

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId from token." });
  }

  try {
    const matchingRoom = await prisma.room.findFirst({
      where: {
        hotelId,
        name: roomType,
        rateType,
      },
      select: {
        id: true,
      },
    });

    if (!matchingRoom) {
      return res.status(404).json({ error: "No matching room found for the given criteria." });
    }

    const availableCount = await prisma.roomUnit.count({
      where: {
        roomId: matchingRoom.id,
        status: "AVAILABLE", // adjust if your schema uses a different value
      },
    });

    res.json({ numOfRooms: availableCount });
  } catch (error) {
    console.error("Failed to fetch available rooms:", error);
    res.status(500).json({ error: "Internal server error while fetching available rooms." });
  }
};
