import express from 'express';
import { createOrder, verifyPayment, getAllPlans } from '../controllers/paymentController.js';
import { auth, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

router.post(
  '/create-order',
  auth,
  authorizeRoles('HOTELADMIN'),
  createOrder
);

router.post(
  '/verify-payment',
  auth,
  authorizeRoles('HOTELADMIN'),
  verifyPayment
);
router.get(
  "/all-plans",
  auth,
  authorizeRoles("HOTELADMIN"),
  getAllPlans
);

export default router;
