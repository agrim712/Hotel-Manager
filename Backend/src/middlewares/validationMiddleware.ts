import { Request, Response, NextFunction } from "express";
import { AnyZodObject, z } from "zod";

export const validateRequest =
  (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request body, query, and params against the schema
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Attach the validated data to the request object
      req.body = validatedData.body;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            path: err.path.join("."), // Field path (e.g., "body.propertyName")
            message: err.message, // Error message (e.g., "Property name is required")
          })),
        });
      }

      // Handle other errors
      return res.status(500).json({ error: "Something went wrong" });
    }
  };