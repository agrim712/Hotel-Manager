import pkg from "@prisma/client";
const { PrismaClient } = pkg;


import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const prisma = new PrismaClient();

// Validation schemas
const saveFormSchema = [
  body('data').isObject().withMessage('Form data must be an object'),
  body('currentSection').isString().withMessage('Section must be a string'),
  body('uploadedFiles').optional().isObject()
];

// Rate limiter
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many form submissions from this IP'
});

export const saveForm = [
  ...saveFormSchema,
  
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { data, currentSection } = req.body;
      
      const userId = req.user.id;
      console.log("Received data to save:", { userId, data, currentSection });


      // Upsert the saved form data
      const savedForm = await prisma.savedForm.upsert({
        where: { userId },
        update: { 
          formData: data,
          currentSection,
        },
        create: {
          userId,
          formData: data,
          currentSection,
        }
      });
      console.log("Data saved in DB:", savedForm);

      res.status(200).json({
        success: true,
        data: savedForm
      });
      
    } catch (error) {
      console.error('Error saving form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save form data',
        error: error.message
      });
    } finally {
      await prisma.$disconnect();
    }
  }
];

export const getSavedForm = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedForm = await prisma.savedForm.findUnique({
      where: { userId }
    });

    if (!savedForm) {
      return res.status(404).json({
        success: false,
        message: 'No saved form found'
      });
    }

    res.status(200).json({
      success: true,
      data: savedForm
    });
  } catch (error) {
    console.error('Error fetching saved form:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved form',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
};