// src/controllers/roomTypeController.js

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRoomTypes = async (req, res) => {
    const { hotelId } = req.user;
      if (!hotelId) {
    return res.status(400).json({ error: "Missing hotelId query parameter." });
  }

  try {
    const roomTypes = await prisma.room.findMany({
       where: { hotelId },
      select: {
        name: true,
      },
      distinct: ['name'],
    });

    const formatted = roomTypes.map(type => ({
      value: type.name,
      label: type.name
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch room types:", error);
    res.status(500).json({ error: "Internal server error while fetching room types." });
  }
};
