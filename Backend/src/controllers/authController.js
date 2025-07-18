import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Configuration
const SUPERADMIN_EMAIL = 'superadmin@asyncotel.com';
const SUPERADMIN_PASSWORD = 'Admin@1234';
const PASSWORD_MIN_LENGTH = 8;

// Helper functions
const validatePassword = (password) => {
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }
};

// SUPERADMIN LOGIN
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // --- SUPERADMIN Login ---
    if (role === 'SUPERADMIN') {
      if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      let user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: SUPERADMIN_EMAIL,
            password: await bcrypt.hash(SUPERADMIN_PASSWORD, 10),
            role: 'SUPERADMIN'
          }
        });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '6h' }
      );

      return res.status(200).json({
        token,
        role: user.role,
        email: user.email
      });
    }

    // --- HOTELADMIN Login ---
    if (role === 'HOTELADMIN') {
      const user = await prisma.user.findFirst({
        where: {
          email,
          role: 'HOTELADMIN'
        },
        include: { hotel: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
          hotelId: user.hotelId,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        token,
        role: user.role,
        hotelId: user.hotelId,
        hotelName: user.hotel?.name || null,
        isPaymentDone: user.hotel?.isPaymentDone || false,
        products: user.hotel?.products || [] // ✅ Send purchased modules
      });
    }

    return res.status(400).json({ error: 'Invalid role specified' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// --- Create HOTELADMIN ---
export const createHotelAdmin = async (req, res) => {
  const { hotelEmail, hotelPassword, hotelName, hotelAddress } = req.body;

  try {
    if (!hotelEmail || !hotelPassword || !hotelName || !hotelAddress) {
      return res.status(400).json({ error: 'Email, password, hotel name, and address are required' });
    }

    // Password validation
    if (hotelPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: hotelEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if hotel with same address already exists
    const existingHotel = await prisma.hotel.findFirst({
      where: { registeredAddress: hotelAddress.trim() }
    });

    if (existingHotel) {
      return res.status(400).json({ error: "A hotel with this address already exists." });
    }

    // Create Hotel with required fields
    const hotel = await prisma.hotel.create({
      data: {
        name: hotelName,
        registeredAddress: hotelAddress.trim(),
        contactPerson: "Not Set",
        phoneNumber: "0000000000",
        email: hotelEmail,
        pinCode: "000000",
        panNumber: "TEMP-PAN",
        checkInTime: "12:00",
        checkOutTime: "10:00",
        cancellationPolicy: "Standard cancellation policy",
        totalRooms: 0,
      }
    });

    // Create Hotel Admin User
    const user = await prisma.user.create({
      data: {
        email: hotelEmail,
        password: await bcrypt.hash(hotelPassword, 10),
        role: 'HOTELADMIN',
        hotelId: hotel.id
      }
    });

    // Generate Token
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        hotelId: hotel.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'Hotel admin created successfully',
      hotelId: hotel.id,
      userId: user.id,
      token
    });

  } catch (err) {
    console.error("Error creating hotel admin:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
