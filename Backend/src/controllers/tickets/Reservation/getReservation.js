import pkg from "@prisma/client";`nconst { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const getRes = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId;
    if (!hotelId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const { 
      fromDate, 
      toDate, 
      filterOption,
      searchText 
    } = req.query;

    // Base where clause
    const where = { hotelId };

    // Date range filtering (checks any relevant date)
    if (fromDate && toDate) {
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);
      
      where.OR = [
        // Booked within date range
        { createdAt: { gte: startDate, lte: endDate } },
        // Check-in within date range
        { checkIn: { gte: startDate, lte: endDate } },
        // Check-out within date range
        { checkOut: { gte: startDate, lte: endDate } },
        // Stay overlaps with date range (check-in before and check-out after)
        { 
          AND: [
            { checkIn: { lte: startDate } },
            { checkOut: { gte: endDate } }
          ]
        },
        // Partial overlap cases
        {
          AND: [
            { checkIn: { lte: endDate } },
            { checkOut: { gte: startDate } }
          ]
        }
      ];
    }

    // Additional filtering for non-date searches
    if (filterOption && searchText && filterOption !== 'Booking Date') {
      const fieldMap = {
        'Booking ID': 'id',
        'Customer Name': 'guestName',
        'Phone Number': 'phone',
        'Email': 'email'
      };
      
      const field = fieldMap[filterOption];
      if (field) {
        where[field] = {
          contains: searchText,
          mode: 'insensitive'
        };
      }
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: { connectedRooms: true },
      orderBy: { checkIn: 'asc' }
    });

    res.json({ 
      success: true, 
      data: reservations.map(res => ({
        ...res,
        bookingId: res.id,
        customerName: res.guestName,
        bookedOn: res.createdAt,
        status: 'Confirmed'
      }))
    });
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch reservations',
      error: err.message 
    });
  }
};