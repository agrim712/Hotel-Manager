import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function parseDateStrict(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return null;
  }
  return d;
}

export const createReservation = async (req, res) => {
  try {
    const data = req.body;
    const photoFile = req.file;

    // 🏨 Extract hotelId from logged-in user
    const hotelId = req.user?.hotelId;
    if (!hotelId) {
      return res.status(401).json({ success: false, message: "Unauthorized: hotelId missing from user" });
    }

    // 📅 Parse and validate dates
    const checkIn = parseDateStrict(data.checkInDate);
    const checkOut = parseDateStrict(data.checkOutDate);
    const dob = data.dob ? parseDateStrict(data.dob) : null;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "Invalid check-in or check-out date" });
    }
    if (checkOut <= checkIn) {
      return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
    }

    // 🧮 Calculated & numeric fields
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const guests = Number(data.numberOfGuests);
    const rooms = Number(data.numRooms);
    const roomNo = data.roomNumbers;

    const perDayRate = parseFloat(data.perDayRate);
    const perDayTax = parseFloat(data.perDayTax);
    const totalAmount = parseFloat(data.totalAmount) || perDayRate * nights * rooms;
    const taxInclusive = data.taxInclusive === 'true' || data.taxInclusive === true;

    if (isNaN(guests) || isNaN(rooms) || isNaN(perDayRate) || isNaN(perDayTax)) {
      return res.status(400).json({ success: false, message: "Invalid numeric values" });
    }
    const roomNoArray = typeof data.roomNumbers === 'string'
  ? data.roomNumbers.split(',').map(r => r.trim())
  : data.roomNumbers;

    // 🖼️ Photo path
    const photoIdPath = photoFile ? photoFile.path : null;
        const matchedRooms = await prisma.room.findMany({
      where: {
        roomNumbers: {
          hasSome: roomNoArray, // this works with string[]
        },
        hotelId,
      },
    });

    if (matchedRooms.length === 0) {
      return res.status(400).json({ success: false, message: "No matching rooms found for given room numbers" });
    }
    const matchingRoomUnits = await prisma.roomUnit.findMany({
  where: {
    roomNumber: { in: roomNoArray },
    roomId: { in: matchedRooms.map(room => room.id) },
  },
});

if (matchingRoomUnits.length === 0) {
  return res.status(400).json({ success: false, message: "No matching room units found" });
}

// 🚩 Mark RoomUnits as BOOKED
await Promise.all(
  matchingRoomUnits.map(unit =>
    prisma.roomUnit.update({
      where: { id: unit.id },
      data: { status: 'BOOKED' },
    })
  )
);

    // 💾 Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        checkIn,
        checkOut,
        nights,
        roomType: data.roomType,
        rateType: data.rateType,
        guests,
        rooms,
        roomNo,
        bookedBy: data.bookedBy,
        businessSegment: data.businessSegment,
        billTo: data.billTo,
        paymentMode: data.paymentMode,
        perDayRate,
        perDayTax,
        taxInclusive,
        totalAmount,
        guestName: data.guestName,
        email: data.email,
        phone: data.phone,
        dob,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country,
        specialRequest: data.specialRequest,
        identity: data.identity,
        idDetail: data.idDetail,
        idProof: data.idProof || null,
        photoIdPath,
        hotelId, // ✅ from req.user
                connectedRooms: {
          connect: matchedRooms.map(room => ({ id: room.id })),
        },
      },
      include: {
        connectedRooms: true,
      },
    });

    return res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    console.error("Error creating reservation:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
