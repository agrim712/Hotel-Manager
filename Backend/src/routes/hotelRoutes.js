import express from "express";
import { createHotel } from "../controllers/hotelContoller.js";
import { auth, authorizeRoles } from '../middleware/auth.js';
import { getRoomTypes } from "../controllers/Reservation/roomType.js";
import { getRatePlans } from "../controllers/Reservation/getRatePlans.js";
import { getRoomCount } from "../controllers/Reservation/noOfRooms.js";
import { maxGuests } from "../controllers/Reservation/maxGuest.js";
import { getAvailableRoomNumbers } from "../controllers/Reservation/roomNumber.js";
import { createReservation } from "../controllers/Reservation/reservationController.js";
import { getRes } from "../controllers/Reservation/getReservation.js";
import { getGuests, getPreviousStays } from "../controllers/Guest/guestController.js";
import { getRoomsWithUnits } from '../controllers/roomController.js';
import { getRoomCounts } from "../controllers/roomCountController.js";
import { getAllRoomUnits } from "../controllers/roomUnit.js";
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

// Get __filename equivalent
const __filename = fileURLToPath(import.meta.url);
// Get __dirname equivalent
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'photos');

console.log('Serving static files from:', uploadDir);
// Then check if exists and create

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
    // Use a unique filename: timestamp + original filename
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage });
// Serve uploaded photos
router.use('/photos', express.static(uploadDir));

router.post(
  '/onboard',
  auth,
  authorizeRoles('HOTELADMIN'),
  createHotel
);

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

router.get("/count", auth, authorizeRoles("HOTELADMIN"), getRoomCount);
router.get("/maxguests", auth, authorizeRoles("HOTELADMIN"), maxGuests);
router.get("/room-available-numbers", auth, authorizeRoles("HOTELADMIN"), getAvailableRoomNumbers);

// Add reservation route here
router.post(
  '/reservation/create',
  auth,
  authorizeRoles('HOTELADMIN'), // adjust roles as needed
  upload.single('photo'),
  createReservation
);
router.get("/getreservations",auth, authorizeRoles("HOTELADMIN"), getRes);
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
router.get('/rooms-with-units', auth, authorizeRoles('HOTELADMIN'), getRoomsWithUnits);

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


export default router;
