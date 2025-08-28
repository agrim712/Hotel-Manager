import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getSchedules = async (req, res) => {
  try {
    const schedules = await prisma.maintenanceSchedule.findMany({
      where: { hotelId: req.user.hotelId },
      orderBy: { nextDue: 'asc' }
    });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE schedule
export const createSchedule = async (req, res) => {
  try {
    const { equipment, frequency, lastMaintenance, nextDue, status } = req.body;
    const schedule = await prisma.maintenanceSchedule.create({
      data: {
        equipment,
        frequency,
        lastMaintenance: new Date(lastMaintenance),
        nextDue: new Date(nextDue),
        status,
        hotelId: req.user.hotelId
      }
    });
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};