import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();


export const getRatePlans = async (req, res) => {
  const { roomType } = req.query;
   const { hotelId } = req.user;

  if (!roomType) {
    return res.status(400).json({ error: "Missing roomName in query params." });
  }

  try {
    const ratePlans = await prisma.room.findMany({
      where: {
        name: roomType,
        hotelId: hotelId
      },
      select: {
        rateType: true
      },
      distinct: ["rateType"]
    });

    const formatted = ratePlans.map(plan => ({
      value: plan.rateType,
      label: plan.rateType
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Failed to fetch rate plans:", error);
    res.status(500).json({ error: "Internal server error while fetching rate plans." });
  }
};
