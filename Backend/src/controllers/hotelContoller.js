import { PrismaClient } from '@prisma/client';
import { createHotelSchema } from "../validators/hotelSchema.js";

const prisma = new PrismaClient();

export const createHotel = async (req, res) => {
  try {
    // Validate input data
    const validated = createHotelSchema.parse(req.body);

    // Trim address
    const trimmedAddress = validated.address.trim();

    // Check if a hotel with the trimmed address already exists
    const existingHotel = await prisma.hotel.findUnique({
      where: { address: trimmedAddress }
    });

    if (existingHotel) {
      // If hotel exists, update it
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

      return res.status(201).json({ message: "Hotel created successfully", hotel: newHotel });
    }
  } catch (err) {
    console.error("Hotel create/update error:", err);
    return res.status(400).json({ error: "Invalid data or server error", details: err });
  }
};
