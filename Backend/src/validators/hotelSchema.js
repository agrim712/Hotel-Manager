import { z } from "zod";

export const createHotelSchema = z.object({
  name: z.string(),
  address: z.string(),
  country: z.string(),
  city: z.string(),
  contactPerson: z.string(),
  phoneCode: z.string(),
  phoneNumber: z.string(),
  whatsappNumber: z.string().optional(),
  totalRooms: z.number(),
  email: z.string().email(),
  propertyType: z.string(),
  currency: z.string(),
  products: z.array(z.string()),

  // Add rooms validation
  rooms: z.array(
    z.object({
      name: z.string(),
      numOfRooms: z.number().int().positive(),
      maxGuests: z.number().int().positive(),
      rateType: z.string(),
      rate: z.number().positive(),
      extraAdultRate: z.number().optional(),
      roomNumbers: z.array(z.string()).nonempty()
    })
  ).optional() // make optional if not always provided
});
export const roomUnitSchema = z.object({
  roomNumber: z.string(),
  status: z.enum(["AVAILABLE", "BOOKED", "MAINTENANCE"]).optional(),
  notes: z.string().optional(),
  floor: z.number().int().optional(),
  roomId: z.string(),
});
