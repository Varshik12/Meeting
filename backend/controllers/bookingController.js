import {
  getBookingsByFilter,
  insertBooking,
  deleteBookingById,
  findRoomById,
} from '../repositories/storage.js';
import {
  validateWorkingHours,
  findConflictingBooking,
} from '../services/bookingService.js';

/**
 * GET /api/bookings
 * Query params:
 *   - roomId or room_id (optional)
 *   - date (optional, YYYY-MM-DD)
 */
export async function getBookings(req, res) {
  try {
    const roomId = req.query.roomId || req.query.room_id;
    const date = req.query.date;

    const filters = {};
    if (roomId && roomId !== 'all') {
      filters.roomId = roomId.trim();
    }
    if (date && date !== 'all') {
      filters.date = date.trim();
    }

    const bookings = await getBookingsByFilter(filters);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve bookings. Please try again.',
    });
  }
}

/**
 * POST /api/bookings
 * PART A: Pure Conflict Detection & Booking Creation
 * 
 * Rules:
 * - Reject outside working hours (09:00 to 18:00) -> 400 Bad Request
 * - Reject end time <= start time -> 400 Bad Request
 * - Reject conflict with existing booking on same room & date -> 409 Conflict
 * - Back-to-back bookings (e.g. 10:00-11:00 and 11:00-12:00) are strictly ALLOWED.
 */
export async function createBooking(req, res) {
  try {
    const {
      roomId,
      room_id,
      title,
      date,
      startTime,
      endTime,
      organizer,
      attendeesCount,
      notes,
    } = req.body;

    const targetRoomId = (roomId || room_id || '').trim();

    // 1. Basic parameter presence check
    if (!targetRoomId) {
      return res.status(400).json({
        success: false,
        error: "Missing required field 'roomId'.",
      });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required field 'title'.",
      });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
      return res.status(400).json({
        success: false,
        error: "Invalid or missing 'date'. Expected YYYY-MM-DD format (e.g., 2026-09-30).",
      });
    }
    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: "Both 'startTime' and 'endTime' are required in 24h format HH:mm (e.g., 10:00).",
      });
    }

    // 2. Room existence check
    const room = await findRoomById(targetRoomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: `Meeting room with ID '${targetRoomId}' does not exist.`,
      });
    }

    // 3. Working Hours & Time Range Validation (09:00 - 18:00 & end > start)
    const hoursValidation = validateWorkingHours(startTime.trim(), endTime.trim());
    if (!hoursValidation.valid) {
      return res.status(400).json({
        success: false,
        error: hoursValidation.error,
      });
    }

    // 4. Retrieve all existing bookings for this room on the given date
    const existingBookings = await getBookingsByFilter({
      roomId: room.id || room._id || targetRoomId,
      date: date.trim(),
    });

    // 5. PART A Conflict Detection Logic
    const conflict = findConflictingBooking(
      startTime.trim(),
      endTime.trim(),
      existingBookings
    );

    if (conflict) {
      const conflictMsg = `Conflict detected: Requested time ${startTime.trim()}-${endTime.trim()} overlaps with existing booking "${conflict.title}" (${conflict.startTime}-${conflict.endTime}) in ${room.name}.`;
      
      return res.status(409).json({
        success: false,
        error: conflictMsg,
        conflictingBooking: {
          id: conflict._id || conflict.id,
          title: conflict.title,
          startTime: conflict.startTime,
          endTime: conflict.endTime,
          organizer: conflict.organizer,
        },
      });
    }

    // 6. Conflict check passed -> persist booking
    const newBooking = await insertBooking({
      roomId: room.id || room._id || targetRoomId,
      title: title.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      organizer: organizer?.trim() || 'Team Member',
      attendeesCount: attendeesCount ? parseInt(attendeesCount, 10) : 2,
      notes: notes?.trim() || '',
    });

    return res.status(201).json({
      success: true,
      message: `Room "${room.name}" booked successfully for ${startTime.trim()} - ${endTime.trim()}.`,
      data: newBooking,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while creating the booking.',
    });
  }
}

/**
 * DELETE /api/bookings/:id
 * Cancels a booking by ID.
 */
export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID parameter is required.',
      });
    }

    const deleted = await deleteBookingById(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Booking with ID '${id}' was not found or has already been cancelled.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Booking "${deleted.title}" (${deleted.startTime} - ${deleted.endTime}) has been cancelled.`,
      data: deleted,
    });
  } catch (error) {
    console.error(`Error deleting booking ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      error: 'Failed to cancel booking. Please try again.',
    });
  }
}
