// src/controllers/roomCountController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const maxGuests = async (req, res) => {
  const { roomType, rateType } = req.query;
  const { hotelId } = req.user;
    console.log(hotelId);
  if (!roomType || !rateType) {
    return res.status(400).json({ error: "Missing roomType or rateType in query params." });
  }

  if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId from token." });
  }

  try {
    const result = await prisma.room.findFirst({
      where: {
        hotelId,
        name: roomType,
        rateType
      },
      select: {
        maxGuests: true
      }
    });

    if (!result) {
      return res.status(404).json({ error: "No matching room found for the given criteria." });
    }

    res.json({ maxGuests: result.maxGuests });
  } catch (error) {
    console.error("Failed to fetch number of rooms:", error);
    res.status(500).json({ error: "Internal server error while fetching number of rooms." });
  }
};
