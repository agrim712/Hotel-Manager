import Razorpay from 'razorpay';
import crypto from 'crypto';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (req, res) => {
  if (!req.user || !req.user.hotelId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const hotelId = req.user.hotelId;

  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (typeof amount !== 'number' || amount < 1 || !receipt) {
        return res.status(400).json({ error: 'A valid amount (at least 1) and a receipt are required.' });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency: currency,
      receipt
    };

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return res.status(404).json({ error: 'No hotel profile found for this user.' });
    }

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      hotelInfo: {
        contactPerson: hotel.contactPerson,
        email: hotel.email,
        phoneNumber: hotel.phoneNumber,
      }
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    // Provide more detailed error feedback from Razorpay if available
    const razorpayError = error.error;
    if (razorpayError) {
      return res.status(error.statusCode || 500).json({ 
        error: 'Failed to create order.',
        details: razorpayError.description
      });
    }
    res.status(500).json({ error: 'Failed to create order. Please check server logs.' });
  }
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Missing required payment details.' });
  }
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    try {
      if (!req.user || !req.user.hotelId) {
        return res.status(401).json({ error: 'Authentication required to verify payment.' });
      }
      const hotelId = req.user.hotelId;

      await prisma.hotel.update({
        where: { id: hotelId },
        data: { isPaymentDone: true },
      });

      return res.status(200).json({ success: true, message: 'Payment verified successfully.' });
    } catch (error) {
      console.error('Database Error during payment verification:', error);
      return res.status(500).json({ success: false, message: 'Failed to update payment status in the database.' });
    }
  } else {
    return res.status(400).json({ success: false, error: 'Invalid signature. Payment verification failed.' });
  }
};

export const getAllPlans = async (req, res) => {
  try {
    const plans = await razorpay.plans.all({ count: 50 });

    res.json({
      success: true,
      data: plans.items.map(plan => ({
        id: plan.id,
        name: plan.item.name,
        amount: plan.item.amount / 100, // Correctly convert from paise to rupees for display
        currency: plan.item.currency,
        interval: `${plan.period}ly`,
        description: plan.item.description,
      })),
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch plans.' });
  }
};
