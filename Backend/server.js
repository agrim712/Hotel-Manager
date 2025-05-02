import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import authRoutes from './src/routes/authRoutes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import createSuperAdmin from './src/utils/initialSetup.js'; // Add this import
import hotelRoutes from './src/routes/hotelRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';

const app = express();
const prisma = new PrismaClient();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:5173', // Match your frontend port
  credentials: true
}));

app.use(express.json());

// Database connection and superadmin initialization
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected');
    return createSuperAdmin();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/hotel', hotelRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
});