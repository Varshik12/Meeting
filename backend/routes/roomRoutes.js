import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  deleteRoom,
  seedRooms,
  clearAll,
  getNextAvailableSlot,
} from '../controllers/roomController.js';

const router = Router();

// List all rooms
router.get('/', getRooms);

// Create a new room
router.post('/', createRoom);

// Seed standard 5 rooms
router.post('/seed', seedRooms);

// Clear all bookings
router.post('/clear-all', clearAll);

// Next available slot endpoint (Part B)
router.get('/:roomId/next-available', getNextAvailableSlot);
router.get('/:room_id/next-available', getNextAvailableSlot);

// Get single room details
router.get('/:id', getRoomById);

// Delete room
router.delete('/:id', deleteRoom);

export default router;
