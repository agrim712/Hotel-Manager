import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

import { auth, authorizeRoles } from "../middleware/auth.js";
import { createHotel, getAvailableUpgrades } from "../controllers/hotelContoller.js";
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
import { downloadHotelPolicy } from '../controllers/hotelContoller.js';


const prisma = new PrismaClient();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'photos');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.use('/photos', express.static(uploadDir));

/* ======================= Hotel Routes ======================= */
router.post('/onboard', auth, authorizeRoles('HOTELADMIN'), createHotel);

router.get('/me', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { hotel: true },
    });

    if (!user?.hotel) return res.status(404).json({ error: "Hotel not found" });

    res.json({ hotel: user.hotel });
  } catch (err) {
    console.error("Error fetching hotel profile:", err);
    res.status(500).json({ error: "Failed to fetch hotel profile" });
  }
});

router.get('/available-upgrades', auth, authorizeRoles('HOTELADMIN'), getAvailableUpgrades);

/* ===================== Reservation Routes ==================== */
router.post('/reservation/create', auth, authorizeRoles('HOTELADMIN'), upload.single('photo'), createReservation);
router.put('/reservation/update/:id', auth, authorizeRoles('HOTELADMIN'), updateReservation);
router.delete('/reservation/delete/:id', auth, authorizeRoles('HOTELADMIN'), deleteReservation);
router.get('/getreservations', auth, authorizeRoles('HOTELADMIN'), getRes);

/* ======================== Room Routes ======================== */
router.get('/room-types', auth, authorizeRoles('HOTELADMIN'), getRoomTypes);
router.get('/rate-plans', auth, authorizeRoles('HOTELADMIN'), getRatePlans);
router.get('/count', auth, authorizeRoles('HOTELADMIN'), getRoomCount);
router.get('/maxguests', auth, authorizeRoles('HOTELADMIN'), maxGuests);
router.get('/available-rooms', auth, authorizeRoles('HOTELADMIN'), getAvailableRoomNumbers);
router.get('/rooms-with-units', auth, authorizeRoles('HOTELADMIN'), getRoomsWithUnits);
router.get('/roomunits', auth, authorizeRoles('HOTELADMIN'), getAllRoomUnits);
router.put('/roomunits/:id/status', auth, authorizeRoles('HOTELADMIN'), updateRoomUnitStatus);
router.get('/room-count', auth, authorizeRoles('HOTELADMIN'), getRoomCounts);

/* ======================== Guest Routes ======================== */
router.get('/guests', auth, authorizeRoles('HOTELADMIN'), getGuests);
router.get('/reservations/previous-stays/:email', auth, authorizeRoles('HOTELADMIN'), getPreviousStays);
router.get(
  "/hotel-policy",
  auth,
  authorizeRoles("HOTELADMIN"),
  downloadHotelPolicy
);

/* ======================== Report Routes ======================== */
router.get('/reports/day-wise-report', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Missing from/to date in query' });

    const hotelId = req.user.hotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId, checkIn: { gte: new Date(from), lte: new Date(to) } },
      select: { checkIn: true, totalAmount: true },
    });

    const revenueMap = {};
    reservations.forEach(res => {
      const dateStr = res.checkIn.toLocaleDateString('sv-SE');
      revenueMap[dateStr] = (revenueMap[dateStr] || 0) + Number(res.totalAmount || 0);
    });

    res.json({ data: revenueMap });
  } catch (err) {
    console.error('Error fetching day wise report:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/reports/room-wise-report', auth, authorizeRoles('HOTELADMIN'), async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'Missing from/to date in query' });

    const hotelId = req.user.hotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId, checkIn: { gte: new Date(from), lte: new Date(to) } },
      select: {
        roomNo: true,
        perDayRate: true,
        perDayTax: true,
        nights: true,
        taxInclusive: true,
      },
    });

    const report = {};
    for (const r of reservations) {
      const rate = r.perDayRate ?? 0;
      const tax = r.perDayTax ?? 0;
      const nights = r.nights ?? 1;
      const total = r.taxInclusive ? rate * nights : (rate + tax) * nights;
      report[r.roomNo] = (report[r.roomNo] || 0) + total;
    }

    res.json({ data: report });
  } catch (err) {
    console.error('Error generating Room Wise Report:', err);
    res.status(500).json({ error: 'Failed to generate Room Wise Report' });
  }
});

export default router;
