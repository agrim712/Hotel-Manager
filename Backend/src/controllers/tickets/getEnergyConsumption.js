import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getEnergyConsumption = async (req, res) => {
  try {
    const energyData = await prisma.energyConsumption.findMany({
      where: { hotelId: req.user.hotelId },
      orderBy: { month: 'desc' }
    });
    res.json(energyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};