import express from "express";
import { createHotel } from "../controllers/hotelContoller.js";
import { auth, authorizeRoles } from '../middleware/auth.js';
import {getRoomTypes } from "../controllers/Reservation/roomType.js";
import {getRatePlans } from "../controllers/Reservation/getRatePlans.js";
import { getRoomCount } from "../controllers/Reservation/noOfRooms.js";
const router = express.Router();

router.post(
    '/onboard',
    auth,
    authorizeRoles('HOTELADMIN'), // 💡 Only hotel admins can onboard
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

export default router;
