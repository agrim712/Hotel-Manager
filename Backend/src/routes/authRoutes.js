import express from 'express';
import { login, createHotelAdmin } from '../controllers/authController.js';
import { auth, authorizeRoles } from '../middleware/auth.js'; // Now properly imported

const router = express.Router();

// Public routes
router.post('/login', login);

// Protected routes
router.post('/hotel-admins', 
  auth, // Verify token first
  authorizeRoles('SUPERADMIN'), // Then verify role
  createHotelAdmin
);

export default router;