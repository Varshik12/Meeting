import { Router } from 'express';
import {
  getBookings,
  createBooking,
  cancelBooking,
} from '../controllers/bookingController.js';

const router = Router();

// Filter bookings by room and date
router.get('/', getBookings);

// Create a new booking with conflict detection (Part A)
router.post('/', createBooking);

// Cancel a booking by ID
router.delete('/:id', cancelBooking);

export default router;
