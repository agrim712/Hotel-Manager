import { PrismaClient } from '@prisma/client';
import { createHotelSchema } from "../validators/hotelSchema.js";  // Import the schema

const prisma = new PrismaClient();

export const createHotel = async (req, res) => {
  try {
    // Validate input data using the schema
    const validated = createHotelSchema.parse(req.body);

    // Trim the address to ensure no extra spaces
    const trimmedAddress = validated.address.trim();

    // Check if the hotel already exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { address: trimmedAddress }
    });

    // Handle case where hotel exists (update it)
    if (existingHotel) {
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
          products: validated.products,
        }
      });

      // Update the rooms if provided in the request
      if (validated.rooms) {
        // Delete existing rooms and create new ones
        await prisma.room.deleteMany({ where: { hotelId: updatedHotel.id } });

        // Create new rooms for the updated hotel
        const roomData = validated.rooms.map(room => ({
          name: room.name,
          numOfRooms: room.numOfRooms,
          maxGuests: room.maxGuests,
          rateType: room.rateType,
          rate: room.rate,
          extraAdultRate: room.extraAdultRate,
          roomNumbers: room.roomNumbers,
          hotelId: updatedHotel.id,  // Associate rooms with the hotel
        }));

        await prisma.room.createMany({
          data: roomData,
        });
      }

      return res.status(200).json({ message: "Hotel updated successfully", hotel: updatedHotel });
    } else {
      // If hotel doesn't exist, create it
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
          products: validated.products,
        }
      });

      // If rooms are provided, create them
      if (validated.rooms) {
        const roomData = validated.rooms.map(room => ({
          name: room.name,
          numOfRooms: room.numOfRooms,
          maxGuests: room.maxGuests,
          rateType: room.rateType,
          rate: room.rate,
          extraAdultRate: room.extraAdultRate,
          roomNumbers: room.roomNumbers,
          hotelId: newHotel.id,  // Associate rooms with the newly created hotel
        }));

        await prisma.room.createMany({
          data: roomData,
        });
      }

      return res.status(201).json({ message: "Hotel created successfully", hotel: newHotel });
    }
  } catch (err) {
    console.error("Hotel create/update error:", err);
    return res.status(400).json({ error: "Invalid data or server error", details: err });
  }
};
