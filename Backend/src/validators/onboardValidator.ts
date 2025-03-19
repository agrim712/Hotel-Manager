import { z } from "zod";

export const onboardSchema = z.object({
  body: z.object({
    propertyName: z.string().min(1, "Property name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    yourName: z.string().min(1, "Your name is required"),
    phoneCode: z.string().min(1, "Phone code is required"),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
    whatsappNumber: z.string().optional(),
    email: z.string().email("Invalid email"),
    totalRooms: z.number().min(1, "Total rooms must be at least 1"),
    propertyType: z.enum(["Hotel", "Vacation Rental"]),
    products: z.array(z.string()).min(1, "At least one product must be selected"),
    currency: z.string().min(1, "Currency is required"),
    rooms: z.array(
      z.object({
        roomName: z.string().min(1, "Room name is required"),
        numOfRooms: z.number().min(1, "Number of rooms must be at least 1"),
        maxGuests: z.number().min(1, "Max guests must be at least 1"),
        rateType: z.string().min(1, "Rate type is required"),
        rate: z.number().min(0, "Rate must be a positive number"),
        extraAdultRate: z.number().min(0, "Extra adult rate must be a positive number").optional(),
        roomNumbers: z.array(z.string()).min(1, "At least one room number is required"),
      })
    ),
  }),
  query: z.object({}), // Add validation rules for query parameters if needed
  params: z.object({}), // Add validation rules for route parameters if needed
});

export type OnboardSchema = z.infer<typeof onboardSchema>;