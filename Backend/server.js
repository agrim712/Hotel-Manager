import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import authRoutes from './src/routes/authRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import createSuperAdmin from './src/utils/initialSetup.js';
import hotelRoutes from './src/routes/hotelRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import posRoutes from './src/routes/posRoutes.js';
import Superadmin from "./src/routes/Superadmin.js";
import cron from 'node-cron';
import expenseRoutes from './src/routes/expenseRoutes.js';
import pricing from "./src/routes/pricing.js"
import revenueRoutes from './src/routes/revenueRoutes.js';
import { updateRoomUnitStatus } from './src/controllers/Reservation/changeStatus.js';
import './src/cron/yearlyAvailability.js';

import path from 'path';

const app = express();


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware Setup - ORDER MATTERS!
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body Parsing Middleware - MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Create HTTP server
const server = createServer(app);

// WebSocket Setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

// Routes - Register AFTER middleware
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/hotel', hotelRoutes); // Only register once!
app.use('/api/expense', expenseRoutes);
app.use('/api/pos', posRoutes);
app.use("/api/superadmin", Superadmin);
app.use("/api", pricing);
app.use('/api/revenue', revenueRoutes);
// Health Check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'Connected',
    websocket: 'Active',
    timestamp: new Date().toISOString()
  });
});

// Error Handling - Should be last
app.use(errorHandler);

// Database Connection
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected');
    return createSuperAdmin();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Cron Job
cron.schedule('*/15 * * * *', () => {
  console.log('⏳ Running scheduled room unit status check...');
  updateRoomUnitStatus(io).catch(console.error);
});


// Server Start
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Client should send { hotelId } to join hotel's room
  socket.on('joinHotel', ({ hotelId }) => {
    if (!hotelId) return;
    const room = `hotel_${hotelId}`;
    socket.join(room);
    console.log(`Socket ${socket.id} joined ${room}`);
  });

  // Optional: let client leave hotel room
  socket.on('leaveHotel', ({ hotelId }) => {
    if (!hotelId) return;
    socket.leave(`hotel_${hotelId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌐 WebSocket server active`);
});
export { app, server, io };