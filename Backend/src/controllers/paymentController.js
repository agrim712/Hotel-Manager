import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
const prisma = new PrismaClient();

// Create order
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || !receipt) {
      return res.status(400).json({ error: "Amount and receipt are required" });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Verify payment signature (optional, for secure backend validation)
export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, hotelId } = req.body;
  console.log("REQ.BODY", req.body);

  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    try {
      const hotel = await prisma.hotel.update({
        where: { id: hotelId },
        data: { isPaymentDone: true },
      });

      return res.status(200).json({ success: true, message: 'Payment verified and hotel status updated.' });
    } catch (error) {
      console.error('Database Error:', error.message, error.stack);
      return res.status(500).json({ success: false, message: 'Failed to update payment status' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Invalid signature' });
  }
};

