// src/controllers/roomCountController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getRoomCount = async (req, res) => {
  const { roomType, rateType, checkIn, checkOut } = req.query;
  const { hotelId } = req.user;

  if (!roomType || !rateType || !checkIn || !checkOut) {
    return res.status(400).json({ error: "Missing query parameters." });
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
        roomUnits: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!matchingRoom) {
      return res.status(404).json({ error: "No matching room found." });
    }

    const roomUnitIds = matchingRoom.roomUnits.map((ru) => ru.id);

    // Fetch reservations that overlap with the given checkIn and checkOut
    const conflictingReservations = await prisma.reservation.findMany({
        where: {
    roomUnitId: { in: roomUnitIds },
    AND: [
      {
        checkIn: { lt: new Date(checkOut) },
      },
      {
        checkOut: { gt: new Date(checkIn) },
      },
    ],
  },
      select: {
        roomUnitId: true,
      },
    });

    const bookedRoomUnitIds = conflictingReservations.map((r) => r.roomUnitId);

    // Count room units that are NOT in bookedRoomUnitIds
    const availableCount = await prisma.roomUnit.count({
      where: {
        id: {
          in: roomUnitIds,
          notIn: bookedRoomUnitIds,
        },
      },
    });

    res.json({ numOfRooms: availableCount });
  } catch (error) {
    console.error("Failed to fetch available rooms:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
