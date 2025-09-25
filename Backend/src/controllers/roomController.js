import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const FIN_YEAR_START_MONTH = 3; // April = 3 (0-indexed)
const FIN_YEAR_START_DAY = 1;

function getFinancialYearIndex(date) {
  const fyStart = new Date(date.getFullYear(), FIN_YEAR_START_MONTH, FIN_YEAR_START_DAY);
  // If date is before April, it's part of previous FY
  if (date < fyStart) fyStart.setFullYear(fyStart.getFullYear() - 1);
  const diffTime = date - fyStart;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)); // index in statusArray / prices
}

export const getAvailableRoomNumbers = async (req, res) => {
  const { hotelId } = req.user;
  try {
    const { checkInDate, checkOutDate, roomType, rateType } = req.query;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Step 1: Get all RoomUnits for the hotel matching roomType and rateType
    const roomUnits = await prisma.roomUnit.findMany({
      where: {
        hotelId,
        room: {
          name: roomType,
          rateType
        }
      },
      include: {
        room: {
          include: {
            dailyRates: {
              where: { rateType }, // only get matching rateType
            }
          }
        }
      }
    });

    const availableUnits = [];

    for (const unit of roomUnits) {
      const roomDailyRate = unit.room.dailyRates[0]; // assuming one dailyRate per rateType per year
      if (!roomDailyRate) continue;

      const statusArray = unit.statusArray; // 365 entries
      const prices = roomDailyRate.prices; // 365 entries

      let isAvailable = true;

      // Loop through requested days
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        const idx = getFinancialYearIndex(d);
        if (idx < 0 || idx >= statusArray.length) {
          isAvailable = false; // date out of financial year
          break;
        }
        if (statusArray[idx] !== "AVAILABLE" || prices[idx] === 0) {
          isAvailable = false;
          break;
        }
      }

      if (isAvailable) {
        availableUnits.push({
          id: unit.id,
          roomNumber: unit.roomNumber,
          floor: unit.floor,
        });
      }
    }

    res.status(200).json({ success: true, rooms: availableUnits });
  } catch (error) {
    console.error('Error in getAvailableRoomNumbers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
      error: error.message
    });
  }
};


export const getRoomsWithUnits = async (req, res) => {
  const { hotelId } = req.user;

  if (!hotelId) {
    return res.status(400).json({
      success: false,
      error: "Missing hotelId from token."
    });
  }

  try {
    const roomUnits = await prisma.roomUnit.findMany({
      where: { hotelId },
      select: {
        id: true,
        roomNumber: true,
        floor: true,
        statusArray: true,
        cleaningStatus: true,
        room: true
      },
      orderBy: { roomNumber: 'asc' }
    });

    return res.json({
      success: true,
      count: roomUnits.length,
      rooms: roomUnits
    });

  } catch (error) {
    console.error('Failed to fetch room units with room info:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while fetching room units.',
      details: error.message
    });
  }
};
