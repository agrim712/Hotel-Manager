import express from 'express';
// import { authenticateToken, authorizeHotelAccess } from '../middleware/authMiddleware.js';
import { getAdvancedHotelKPI, updateMultiplierDependencies, getOccupancyAnalysis, getRevenueForecast } from '../controllers/Revenue/revenueAnalyticsController.js';
import { getHotelKPI } from '../controllers/Revenue/revenueController.js';
import { auth, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Basic KPI endpoints
router.get('/kpi/:hotelId', auth, authorizeRoles('HOTELADMIN'), getHotelKPI);

// Enhanced analytics endpoints
router.get('/analytics/:hotelId', auth, authorizeRoles('HOTELADMIN'), getAdvancedHotelKPI);
router.get('/occupancy/:hotelId', auth, authorizeRoles('HOTELADMIN'), getOccupancyAnalysis);
router.get('/forecast/:hotelId', auth, authorizeRoles('HOTELADMIN'), getRevenueForecast);

// Multiplier and dependency management
router.post('/multipliers/:hotelId/update-dependencies', auth, authorizeRoles('HOTELADMIN'), updateMultiplierDependencies);

export default router;