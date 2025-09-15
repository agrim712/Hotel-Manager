import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const getGuests = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const now = new Date();

    const whereClause = {
      AND: [
        {
          OR: [
            { guestName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { idDetail: { contains: search, mode: 'insensitive' } }
          ]
        },
        {
          checkOut: { gt: now }
        }
      ]
    };

    // Step 1: Fetch all relevant reservations with connectedRooms
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        connectedRooms: true
      }
    });

    const guestMap = new Map();

    for (const res of reservations) {
      const roomIds = res.connectedRooms.map(room => room.id);

      if (roomIds.length === 0) continue;

      // Step 2: Fetch all roomUnits corresponding to connectedRooms
      const roomUnits = await prisma.roomUnit.findMany({
        where: {
          roomId: {
            in: roomIds
          }
        }
      });

      // Step 3: Ensure all roomUnits are BOOKED
      const allBooked = roomUnits.every(unit => unit.status === 'BOOKED');
      if (!allBooked) continue;

      const key = `${res.email}-${res.guestName}`;
      if (!guestMap.has(key)) {
        guestMap.set(key, {
          id: res.id,
          guestName: res.guestName,
          email: res.email,
          phone: res.phone,
          roomNos: new Set(),
          totalAmount: 0
        });
      }

      const guest = guestMap.get(key);
      guest.roomNos.add(res.roomNo);
      guest.totalAmount += res.totalAmount || 0;
    }

    const allGuests = Array.from(guestMap.values()).map(g => ({
      ...g,
      roomNo: Array.from(g.roomNos).join(', ')
    }));

    const paginatedGuests = allGuests.slice(skip, skip + limitNumber);
    const totalPages = Math.ceil(allGuests.length / limitNumber);

    res.status(200).json({
      success: true,
      data: paginatedGuests,
      totalPages,
      currentPage: pageNumber
    });
  } catch (error) {
    console.error('Error in getGuests:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


export const getPreviousStays = async (req, res) => {
  try {
    const { email } = req.params;
    const now = new Date();

    const stays = await prisma.reservation.findMany({
      where: {
        email,
        checkOut: {
          lt: now // Only stays where checkOut is before now
        }
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
        nights: true,
        roomType: true,
        roomNo: true,
        totalAmount: true,
        hotel: {
          select: {
            name: true
          }
        }
      },
      orderBy: { checkIn: 'desc' }
    });

    res.status(200).json(stays);
  } catch (error) {
    console.error('Error in getPreviousStays:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
