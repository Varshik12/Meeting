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

// CORS configuration supporting Render deployment, custom FRONTEND_URL, and local dev[cite: 3]
const allowedOrigins = [
  'https://meeting-1-blz4.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map((url) => url.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.onrender.com') ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
  })
);

app.use(express.json());

// Health Check Endpoints (both /api/health and /health)[cite: 3]
const healthHandler = (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Meeting Room Booking API',
    workingHours: '09:00 - 18:00',
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Root Endpoint for API Overview[cite: 3]
app.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Meeting Room Booking API',
    endpoints: {
      rooms: '/api/rooms',
      bookings: '/api/bookings',
      health: '/api/health',
    },
  });
});

// Mount routes WITH /api prefix (Primary standard)[cite: 3]
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Dual-mount routes WITHOUT /api prefix as fallback for direct path calls[cite: 3]
app.use('/rooms', roomRoutes);
app.use('/bookings', bookingRoutes);

// Fallback 404 Route for unmatched paths[cite: 3]
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `API route '${req.originalUrl}' not found on server.`,
  });
});

// Global Error Handler[cite: 3]
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Start Server and Initialize Storage[cite: 3]
async function startServer() {
  await connectDB();
  await initStorage();

  app.listen(PORT, () => {
    console.log(`🚀 Meeting Room Backend API listening on port ${PORT}`);
    console.log(`📍 Health Check: http://localhost:${PORT}/api/health`);
  });
}

startServer();