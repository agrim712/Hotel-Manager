import express from "express";
import { createHotel } from "../controllers/hotelContoller.js";
import { auth, authorizeRoles } from '../middleware/auth.js';
import { getRoomTypes } from "../controllers/Reservation/roomType.js";
import { getRatePlans } from "../controllers/Reservation/getRatePlans.js";
import { getRoomCount } from "../controllers/Reservation/noOfRooms.js";
import { maxGuests } from "../controllers/Reservation/maxGuest.js";
import { getAvailableRoomNumbers, getRoomsWithUnits } from "../controllers/roomController.js";
import { createReservation, updateReservation, deleteReservation } from "../controllers/Reservation/reservationController.js";
import { getRes } from "../controllers/Reservation/getReservation.js";
import { getGuests, getPreviousStays } from "../controllers/Guest/guestController.js";
import { getRoomCounts } from "../controllers/roomCountController.js";
import { getAllRoomUnits } from "../controllers/roomUnit.js";
import { updateRoomUnitStatus } from "../controllers/UpdateStatus.js";
import { markRoomForMaintenance, endMaintenance } from '../controllers/Reservation/maintenanceController.js';
import { generateInvoicePDF } from '../controllers/generateInvoicePDF.js';
import { generateBillPDF } from "../controllers/billController.js";
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get __filename equivalent
const __filename = fileURLToPath(import.meta.url);
// Get __dirname equivalent
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'photos');

console.log('Serving static files from:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

// Multer setup for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Serve uploaded photos
router.use('/photos', express.static(uploadDir));

// Invoice Generation Route - Updated with proper data fetching
router.get('/invoice/:id', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    // Fetch complete reservation data with relations
    const reservation = await prisma.reservation.findUnique({
      where: { id: req.params.id },
      include: {
        hotel: true,
        connectedRooms: true,
        roomUnit: true
      }
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(reservation);

    // Set response headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${reservation.id}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate invoice',
      error: error.message 
    });
  }
});

// Hotel Onboarding
router.post(
  '/onboard',
  auth,
  authorizeRoles('HOTELADMIN'),
  createHotel
);

// Room Management Routes
router.get(
  '/room-types',
  auth,
  authorizeRoles('HOTELADMIN'),
  getRoomTypes
);

router.get(
  '/rate-plans',
  auth,
  authorizeRoles('HOTELADMIN'),
  getRatePlans
);

router.get(
  "/count", 
  auth, 
  authorizeRoles("HOTELADMIN"), 
  getRoomCount
);

router.get(
  "/maxguests", 
  auth, 
  authorizeRoles("HOTELADMIN"), 
  maxGuests
);

router.get(
  "/available-rooms", 
  auth, 
  authorizeRoles("HOTELADMIN"), 
  getAvailableRoomNumbers
);

// Reservation Routes
router.post(
  '/reservation/create',
  auth,
  authorizeRoles('HOTELADMIN'),
  upload.single('photo'),
  createReservation
);

router.put(
  '/reservation/update/:id',
  auth,
  authorizeRoles('HOTELADMIN'),
  updateReservation
);

router.delete(
  '/reservation/delete/:id',
  auth,
  authorizeRoles('HOTELADMIN'),
  deleteReservation
);

router.get(
  "/getreservations", 
  auth, 
  authorizeRoles("HOTELADMIN"), 
  getRes
);

// Guest Management
router.get(
  '/guests',
  auth,
  authorizeRoles('HOTELADMIN'),
  getGuests
);

router.get(
  '/reservations/previous-stays/:email',
  auth,
  authorizeRoles('HOTELADMIN'),
  getPreviousStays
);

// Room Unit Management
router.get(
  '/rooms-with-units', 
  auth, 
  authorizeRoles('HOTELADMIN'), 
  getRoomsWithUnits
);

router.put(
  '/roomunits/:id/status',
  auth,
  authorizeRoles('HOTELADMIN'),
  updateRoomUnitStatus
);

router.get(
  '/room-count',
  auth,
  authorizeRoles('HOTELADMIN'),
  getRoomCounts
);

router.get(
  '/roomunits',
  auth,
  authorizeRoles('HOTELADMIN'),
  getAllRoomUnits
);

// Maintenance Routes
router.post(
  '/maintenance', 
  auth, 
  authorizeRoles('HOTELADMIN'), 
  markRoomForMaintenance
);

router.post(
  '/maintenance/end', 
  auth, 
  authorizeRoles('HOTELADMIN'), 
  endMaintenance
);

// Reporting Routes
router.get(
  '/reports/day-wise-report', 
  auth, 
  authorizeRoles('HOTELADMIN'), 
  async (req, res) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({ message: 'Missing from/to date in query' });
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);
      const hotelId = req.user.hotelId;

      const reservations = await prisma.reservation.findMany({
        where: {
          hotelId: hotelId,
          checkIn: {
            gte: fromDate,
            lte: toDate,
          },
        },
        select: {
          checkIn: true,
          totalAmount: true,
        },
      });

      const revenueMap = {};

      reservations.forEach((res) => {
        const dateStr = res.checkIn.toLocaleDateString('sv-SE'); 
        revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(res.totalAmount || 0);
      });

      res.json({ data: revenueMap });
    } catch (err) {
      console.error('Error fetching day wise report:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);



// Add to your existing routes file (or create a new one)

// Bill Generation Routes
router.get('/bill/generate/:reservationId', generateBillPDF);

router.post(
  '/reservation/:id/bill/items',
  auth,
  authorizeRoles('HOTELADMIN'),
  async (req, res) => {
    try {
      // In a real implementation, you would save these items to the database
      // and associate them with the reservation
      const { items } = req.body;
      
      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.1; // Example tax rate (10%)
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount;

      res.json({
        success: true,
        data: {
          items,
          subtotal,
          taxAmount,
          totalAmount,
          taxRate
        }
      });
    } catch (error) {
      console.error('Error adding bill items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add bill items',
        error: error.message
      });
    }
  }
);

router.post(
  '/reservation/:id/bill/finalize',
  auth,
  authorizeRoles('HOTELADMIN'),
  async (req, res) => {
    try {
      const { paymentMethod, paymentAmount, items } = req.body;
      
      // In a real implementation, you would:
      // 1. Save the bill to the database
      // 2. Update reservation payment status
      // 3. Generate a receipt

      res.json({
        success: true,
        data: {
          billNumber: `BILL-${Date.now()}`,
          paymentMethod,
          paymentAmount,
          items,
          paymentDate: new Date()
        }
      });
    } catch (error) {
      console.error('Error finalizing bill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to finalize bill',
        error: error.message
      });
    }
  }
);

router.get(
  '/reports/room-wise-report', 
  auth, 
  authorizeRoles('HOTELADMIN'), 
  async (req, res) => {
    try {
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({ message: 'Missing from/to date in query' });
      }

      const fromDate = new Date(from);
      const toDate = new Date(to);
      const hotelId = req.user.hotelId;

      const reservations = await prisma.reservation.findMany({
        where: {
          hotelId,
          checkIn: {
            gte: fromDate,
            lte: toDate,
          },
        },
        select: {
          roomNo: true,
          perDayRate: true,
          perDayTax: true,
          nights: true,
          taxInclusive: true,
        },
      });

      const roomWiseReport = {};

      for (const resv of reservations) {
        const rate = resv.perDayRate ?? 0;
        const tax = resv.perDayTax ?? 0;
        const nights = resv.nights ?? 1;
        const taxInclusive = resv.taxInclusive ?? true;

        const total = taxInclusive
          ? rate * nights
          : (rate + tax) * nights;

        if (!roomWiseReport[resv.roomNo]) {
          roomWiseReport[resv.roomNo] = 0;
        }

        roomWiseReport[resv.roomNo] += total;
      }

      res.json({ data: roomWiseReport });
    } catch (err) {
      console.error('Error generating Room Wise Report:', err);
      res.status(500).json({ error: 'Failed to generate Room Wise Report' });
    }
  }
);

export default router;