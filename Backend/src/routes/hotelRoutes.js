import express from "express";
import { createHotel } from "../controllers/hotelContoller.js";
import { auth, authorizeRoles } from '../middleware/auth.js';
const router = express.Router();

router.post(
    '/onboard',
    auth,
    authorizeRoles('HOTELADMIN'), // 💡 Only hotel admins can onboard
    createHotel
  );

export default router;
