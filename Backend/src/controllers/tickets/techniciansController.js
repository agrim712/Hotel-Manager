import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ GET all technicians
export const getTechnicians = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
      where: { hotelId: req.user.hotelId }
    });
    res.json(technicians);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE technician
export const createTechnician = async (req, res) => {
  try {
    const { name, specialty } = req.body;
    const technician = await prisma.technician.create({
      data: {
        name,
        specialty,
        hotelId: req.user.hotelId
      }
    });
    res.status(201).json(technician);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};