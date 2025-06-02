// src/controllers/roomCountController.js
import { PrismaClient, RoomStatus } from "@prisma/client";

const prisma = new PrismaClient();

export const getAvailableRoomNumbers = async (req, res) => {
  const { roomType, rateType } = req.query;
  const { hotelId } = req.user;

  if (!roomType || !rateType) {
    return res.status(400).json({ error: "Missing roomType or rateType in query params." });
  }

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId from token." });
  }

  try {
    // Find the matching Room
    const room = await prisma.room.findFirst({
      where: {
        hotelId,
        name: roomType,
        rateType,
      },
      select: {
        id: true,
      },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found with the given type and rate." });
    }

    // Fetch available room numbers from RoomUnit
    const availableUnits = await prisma.roomUnit.findMany({
      where: {
        roomId: room.id,
        status: RoomStatus.AVAILABLE, // Enum from Prisma
      },
      select: {
        roomNumber: true,
      },
    });

    const roomNumbers = availableUnits.map(unit => unit.roomNumber);

    return res.json({ roomNumbers });
  } catch (error) {
    console.error("Error fetching available room numbers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
