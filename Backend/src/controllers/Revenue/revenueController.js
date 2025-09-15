import pkg from "@prisma/client";
const { PrismaClient } = pkg;


const prisma = new PrismaClient();

function parseDate(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get KPIs: RevPAR, ADR, Occupancy Rate, RevADR
export const getHotelKPI = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    const from = parseDate(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    // Total available rooms
    const totalRoomUnits = await prisma.roomUnit.count({
      where: { hotelId },
    });

    // Occupied rooms (unique roomUnitId per night)
    const reservations = await prisma.reservation.findMany({
      where: {
        hotelId,
        checkIn: { lte: to },
        checkOut: { gte: from },
      },
    });

    let totalRevenue = 0;
    let totalOccupiedRoomNights = 0;

    reservations.forEach((r) => {
      const nights = r.nights;
      const roomCount = r.rooms;
      totalOccupiedRoomNights += nights * roomCount;
      totalRevenue += r.perDayRate * nights * roomCount;
    });

    // Total days in range
    const daysInRange = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    const totalAvailableRoomNights = totalRoomUnits * daysInRange;

    // ADR: Total Room Revenue / Occupied Rooms
    const ADR = totalOccupiedRoomNights > 0 ? totalRevenue / totalOccupiedRoomNights : 0;

    // Occupancy Rate: Occupied Room Nights / Available Room Nights
    const occupancyRate = totalAvailableRoomNights > 0 ? totalOccupiedRoomNights / totalAvailableRoomNights : 0;

    // RevPAR: ADR * Occupancy Rate
    const RevPAR = ADR * occupancyRate;

    // Distribution Cost (e.g., OTA Commissions)
    const commissionExpenses = await prisma.expense.findMany({
      where: {
        hotelId,
        date: { gte: from, lte: to },
        category: {
          name: {
            contains: "commission", // or OTA, Booking.com, etc.
            mode: "insensitive",
          },
        },
      },
    });

    const totalDistributionCost = commissionExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // RevADR = (Room Revenue - Distribution Costs) / Available Room Nights
    const RevADR = totalAvailableRoomNights > 0 ? (totalRevenue - totalDistributionCost) / totalAvailableRoomNights : 0;

    return res.json({
      ADR: ADR.toFixed(2),
      RevPAR: RevPAR.toFixed(2),
      RevADR: RevADR.toFixed(2),
      occupancyRate: (occupancyRate * 100).toFixed(2) + "%",
      totalRevenue,
      totalDistributionCost,
      totalAvailableRoomNights,
      totalOccupiedRoomNights,
    });
  } catch (error) {
    console.error("KPI Error:", error);
    return res.status(500).json({ error: "Failed to compute hotel KPIs" });
  }
};
