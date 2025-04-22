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
});
