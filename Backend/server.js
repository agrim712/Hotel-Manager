import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/authRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import createSuperAdmin from './src/utils/initialSetup.js';
import hotelRoutes from './src/routes/hotelRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import RestaurantRoutes from './src/routes/RestaurantRoutes.js';
import Superadmin from "./src/routes/Superadmin.js";
import cron from 'node-cron';
import expenseRoutes from './src/routes/expenseRoutes.js';
import { updateRoomUnitStatus } from './src/controllers/Reservation/changeStatus.js';
import path from 'path';

const app = express();
const server = createServer(app);

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
app.use('/api/menu', RestaurantRoutes);
app.use("/api/superadmin", Superadmin);

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
cron.schedule('* * * * *', () => {
  console.log('⏳ Running scheduled room unit status check...');
  updateRoomUnitStatus().catch(console.error);
});

// Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`🌐 WebSocket server active`);
});