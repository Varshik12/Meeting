import {
  getAllRooms,
  findRoomById,
  insertRoom,
  deleteRoomById,
  seedDefaultRooms,
  clearAllBookings,
  getBookingsByFilter,
} from '../repositories/storage.js';
import { findNextAvailableSlot } from '../services/bookingService.js';

/**
 * GET /api/rooms
 * Retrieves all pre-seeded meeting rooms.
 */
export async function getRooms(req, res) {
  try {
    const rooms = await getAllRooms();
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve meeting rooms. Please try again.',
    });
  }
}

/**
 * POST /api/rooms
 * Creates a custom meeting room.
 */
export async function createRoom(req, res) {
  try {
    const { name, code, capacity, floor, amenities, description, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Field 'name' is required (e.g. 'Conference Room A').",
      });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: "Field 'code' is required (e.g. 'CONF-A').",
      });
    }
    if (!capacity || isNaN(Number(capacity)) || Number(capacity) < 1) {
      return res.status(400).json({
        success: false,
        error: "Field 'capacity' must be an integer >= 1.",
      });
    }
    if (!floor || !floor.trim()) {
      return res.status(400).json({
        success: false,
        error: "Field 'floor' is required (e.g. 'Floor 2').",
      });
    }

    const room = await insertRoom({
      name: name.trim(),
      code: code.trim(),
      capacity: Number(capacity),
      floor: floor.trim(),
      amenities: Array.isArray(amenities) ? amenities : [],
      description: description?.trim() || '',
      color: color || '#4f46e5',
    });

    return res.status(201).json({
      success: true,
      message: `Meeting room "${room.name}" created successfully.`,
      data: room,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create meeting room.',
    });
  }
}

/**
 * DELETE /api/rooms/:id
 */
export async function deleteRoom(req, res) {
  try {
    const { id } = req.params;
    const deleted = await deleteRoomById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Room '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Room "${deleted.name}" and its bookings were removed.`,
      data: deleted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to delete room.',
    });
  }
}

/**
 * POST /api/rooms/seed
 */
export async function seedRooms(req, res) {
  try {
    const seeded = await seedDefaultRooms();
    return res.status(200).json({
      success: true,
      message: `Seeded ${seeded.length} standard rooms.`,
      data: seeded,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to seed rooms.',
    });
  }
}

/**
 * POST /api/rooms/clear-all
 */
export async function clearAll(req, res) {
  try {
    await clearAllBookings();
    return res.status(200).json({
      success: true,
      message: 'All bookings cleared.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to clear bookings.',
    });
  }
}

/**
 * GET /api/rooms/:id
 */
export async function getRoomById(req, res) {
  try {
    const { id } = req.params;
    const room = await findRoomById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        error: `Meeting room with ID '${id}' not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve room details.',
    });
  }
}

/**
 * PART B: Next Available Slot
 * GET /api/rooms/:roomId/next-available?date=YYYY-MM-DD&duration=MINUTES
 */
export async function getNextAvailableSlot(req, res) {
  try {
    const roomId = req.params.roomId || req.params.room_id || req.params.id;
    const date = req.query.date?.trim();
    const durationRaw = req.query.duration;

    const room = await findRoomById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: `Room '${roomId}' does not exist.`,
      });
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'date' is required and must follow YYYY-MM-DD format (e.g., 2026-09-30).",
      });
    }

    const duration = parseInt(durationRaw, 10);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'duration' is required and must be a positive integer in minutes (e.g., 30, 45, 60, 90).",
      });
    }

    if (duration > 540) {
      return res.status(400).json({
        success: false,
        error: `Requested duration of ${duration} minutes exceeds the total 9-hour working window (540 minutes, 09:00 - 18:00).`,
      });
    }

    const existingBookings = await getBookingsByFilter({ roomId: room.id || room._id || roomId, date });
    const slotResult = findNextAvailableSlot(existingBookings, room.id || room._id || roomId, date, duration);

    return res.status(200).json({
      success: true,
      room: {
        id: room.id || room._id,
        name: room.name,
        code: room.code,
      },
      ...slotResult,
    });
  } catch (error) {
    console.error('Error finding next available slot:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while calculating the next available slot.',
    });
  }
}
