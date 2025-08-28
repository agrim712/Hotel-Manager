import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const createEquipment = async (req, res) => {
  try {
    const { name, roomId, serialNumber, model, purchaseDate } = req.body;

    const equipment = await prisma.equipment.create({
      data: {
        name,
        hotelId: req.user.hotelId,
        roomId: roomId || null,
        serialNumber,
        model,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null
      }
    });

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ error: 'Error creating equipment', details: error.message });
  }
};

export const getEquipments = async (req, res) => {
  try {
    const equipments = await prisma.equipment.findMany({
      where: { hotelId: req.user.hotelId },
      include: { room: true, amcs: true, histories: true }
    });
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching equipment' });
  }
};
