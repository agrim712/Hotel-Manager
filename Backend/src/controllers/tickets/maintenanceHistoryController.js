import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getHistory = async (req, res) => {
  try {
    const history = await prisma.maintenanceHistory.findMany({
      where: { hotelId: req.user.hotelId },
      include: { ticket: true, equipment: true }
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
};
