import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initStorage } from './repositories/storage.js';
import roomRoutes from './routes/roomRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Meeting Room Booking API',
    workingHours: '09:00 - 18:00',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Registration
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Fallback 404 Route for unknown API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' not found.`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server and Initialize Storage
async function startServer() {
  await connectDB();
  await initStorage();

  app.listen(PORT, () => {
    console.log(`🚀 Meeting Room Backend API listening on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
