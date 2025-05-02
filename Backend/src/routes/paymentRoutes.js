import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
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

export default router;
