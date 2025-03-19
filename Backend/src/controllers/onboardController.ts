import { Request, Response } from "express";
import prisma from "../config/db";
import { OnboardSchema } from "../validators/onboardValidator";

export const onboardController = async (req: Request, res: Response) => {
  try {
    // Access the validated data from req.body
    const validatedData: OnboardSchema["body"] = req.body;

    // Create the property in the database
    const newProperty = await prisma.property.create({
      data: {
        ...validatedData,
        products: validatedData.products.join(", "),
        rooms: {
          create: validatedData.rooms.map((room) => ({
            ...room,
            roomNumbers: room.roomNumbers.join(","),
          })),
        },
      },
    });

    // Send success response
    res.status(201).json({ message: "Property onboarded successfully", data: newProperty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export default onboardController;