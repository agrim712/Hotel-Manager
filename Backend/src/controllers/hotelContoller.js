import { PrismaClient } from '@prisma/client';
import { createHotelSchema, roomUnitSchema } from "../validators/hotelSchema.js";

const prisma = new PrismaClient();

export const createHotel = async (req, res) => {
  try {
    const validated = createHotelSchema.parse(req.body);
    const trimmedAddress = validated.address.trim();

    const existingHotel = await prisma.hotel.findUnique({
      where: { address: trimmedAddress }
    });

    if (existingHotel) {
      // ✅ Update existing hotel
      const updatedHotel = await prisma.hotel.update({
        where: { address: trimmedAddress },
        data: {
          name: validated.name,
          country: validated.country,
          city: validated.city,
          contactPerson: validated.contactPerson,
          phoneCode: validated.phoneCode,
          phoneNumber: validated.phoneNumber,
          whatsappNumber: validated.whatsappNumber,
          totalRooms: validated.totalRooms,
          email: validated.email,
          propertyType: validated.propertyType,
          currency: validated.currency,
          products: validated.products, // ✅ Save selected products here
        }
      });

      if (validated.rooms) {
        await prisma.room.deleteMany({ where: { hotelId: updatedHotel.id } });

        for (const room of validated.rooms) {
          const createdRoom = await prisma.room.create({
            data: {
              name: room.name,
              numOfRooms: room.numOfRooms,
              maxGuests: room.maxGuests,
              rateType: room.rateType,
              rate: room.rate,
              extraAdultRate: room.extraAdultRate,
              roomNumbers: room.roomNumbers,
              hotelId: updatedHotel.id,
            }
          });

          const roomUnitData = room.roomNumbers.map(roomNumber => {
            const validatedUnit = roomUnitSchema.parse({
              roomNumber,
              roomId: createdRoom.id
            });
            return validatedUnit;
          });

          await prisma.roomUnit.createMany({ data: roomUnitData });
        }
      }

      return res.status(200).json({ message: "Hotel updated successfully", hotel: updatedHotel });
    } else {
      // ✅ Create new hotel
      const newHotel = await prisma.hotel.create({
        data: {
          name: validated.name,
          address: trimmedAddress,
          country: validated.country,
          city: validated.city,
          contactPerson: validated.contactPerson,
          phoneCode: validated.phoneCode,
          phoneNumber: validated.phoneNumber,
          whatsappNumber: validated.whatsappNumber,
          totalRooms: validated.totalRooms,
          email: validated.email,
          propertyType: validated.propertyType,
          currency: validated.currency,
          products: validated.products, // ✅ Save selected products here
        }
      });

      if (validated.rooms) {
        for (const room of validated.rooms) {
          const createdRoom = await prisma.room.create({
            data: {
              name: room.name,
              numOfRooms: room.numOfRooms,
              maxGuests: room.maxGuests,
              rateType: room.rateType,
              rate: room.rate,
              extraAdultRate: room.extraAdultRate,
              roomNumbers: room.roomNumbers,
              hotelId: newHotel.id,
            }
          });

          const roomUnitData = room.roomNumbers.map(roomNumber => {
            const validatedUnit = roomUnitSchema.parse({
              roomNumber,
              roomId: createdRoom.id
            });
            return validatedUnit;
          });

          await prisma.roomUnit.createMany({ data: roomUnitData });
        }
      }

      return res.status(201).json({ message: "Hotel created successfully", hotel: newHotel });
    }
  } catch (err) {
    console.error("Hotel create/update error:", err);
    return res.status(400).json({ error: "Invalid data or server error", details: err });
  }
};
