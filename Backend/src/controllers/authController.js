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
  // You can add more complex validation rules if needed
};

// Login Function
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    // SUPERADMIN login
    if (role === 'SUPERADMIN') {
      if (email !== SUPERADMIN_EMAIL || password !== SUPERADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Find or create SUPERADMIN
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
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        token,
        role: user.role,
        email: user.email
      });
    }

    // HOTELADMIN login
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
        hotelName: user.hotel?.name || null
      });
    }

    return res.status(400).json({ error: 'Invalid role specified' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Create Hotel Admin
export const createHotelAdmin = async (req, res) => {
  const { hotelEmail, hotelPassword, hotelName, hotelAddress } = req.body;

  try {
    if (!hotelEmail || !hotelPassword || !hotelName || !hotelAddress) {
      return res.status(400).json({ error: 'Email, password, hotel name, and address are required' });
    }

    validatePassword(hotelPassword);

    // const existingHotel = await prisma.hotel.findFirst({
    //   where: { name: hotelName }
    // });

    // if (existingHotel) {
    //   return res.status(400).json({ error: 'Hotel with this name already exists' });
    // }

    const existingUser = await prisma.user.findUnique({
      where: { email: hotelEmail }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create hotel and hotel admin inside a transaction
    const hotel = await prisma.hotel.create({
      data: {
        name: hotelName,
        address: hotelAddress
      }
    });

    const user = await prisma.user.create({
      data: {
        email: hotelEmail,
        password: await bcrypt.hash(hotelPassword, 10),
        role: 'HOTELADMIN',
        hotelId: hotel.id
      }
    });
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
  
    if (err.code === 'P2002' && err.meta?.target?.includes('address')) {
      return res.status(400).json({ error: "Hotel with this address already exists." });
    }
  
    return res.status(500).json({ error: "Internal server error" });
  }
};

