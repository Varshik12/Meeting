/**
 * Pure Business Logic Service for Meeting Room Booking
 * 
 * Implements:
 * 1. Time conversion & working hours validation (Strict 09:00 - 18:00)
 * 2. Pure interval conflict detection (Part A - with back-to-back allowance)
 * 3. Next available slot finder algorithm (Part B - earliest continuous free window)
 * 
 * Zero third-party scheduling libraries used.
 */

export const WORKING_HOURS = {
  START_HOUR: 9,
  START_MINUTE: 0,
  END_HOUR: 18,
  END_MINUTE: 0,
  START_MINUTES: 9 * 60, // 540 minutes from midnight (09:00)
  END_MINUTES: 18 * 60,  // 1080 minutes from midnight (18:00)
};

/**
 * Converts a 24-hour "HH:mm" string into total minutes from midnight.
 * Example: "09:30" -> 9 * 60 + 30 = 570
 */
export function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    throw new Error(`Invalid time format: "${timeStr}". Expected "HH:mm".`);
  }
  const parts = timeStr.trim().split(':');
  if (parts.length !== 2) {
    throw new Error(`Invalid time format: "${timeStr}". Expected "HH:mm".`);
  }
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid time values in "${timeStr}". Hours must be 00-23 and minutes 00-59.`);
  }

  return hours * 60 + minutes;
}

/**
 * Converts minutes from midnight back into a 24-hour padded "HH:mm" string.
 * Example: 570 -> "09:30"
 */
export function minutesToTime(minutes) {
  const clamped = Math.max(0, Math.min(1439, minutes));
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Validates that requested start and end times fall strictly within working hours (09:00 - 18:00)
 * and that end time is strictly greater than start time.
 */
export function validateWorkingHours(startTime, endTime) {
  let startMinutes;
  let endMinutes;

  try {
    startMinutes = timeToMinutes(startTime);
    endMinutes = timeToMinutes(endTime);
  } catch (err) {
    return { valid: false, error: err.message };
  }

  // Rule 1: End time must be strictly after start time
  if (endMinutes <= startMinutes) {
    return {
      valid: false,
      error: `Invalid time range: End time (${endTime}) must be strictly after start time (${startTime}).`,
    };
  }

  // Rule 2: Booking must not start before 09:00
  if (startMinutes < WORKING_HOURS.START_MINUTES) {
    return {
      valid: false,
      error: `Booking starts outside working hours. Operations begin at 09:00, requested start is ${startTime}.`,
    };
  }

  // Rule 3: Booking must not end after 18:00
  if (endMinutes > WORKING_HOURS.END_MINUTES) {
    return {
      valid: false,
      error: `Booking ends outside working hours. Operations conclude at 18:00, requested end is ${endTime}.`,
    };
  }

  return { valid: true };
}

/**
 * PART A — Pure Conflict Detection Algorithm
 * 
 * MATHEMATICAL FORMULATION:
 * Represent each booking as a half-open interval [start, end).
 * Let Requested Interval = [R_start, R_end)
 * Let Existing Interval  = [E_start, E_end)
 * 
 * Two intervals intersect IF AND ONLY IF:
 *   (R_start < E_end) AND (R_end > E_start)
 * 
 * BACK-TO-BACK RULE PROOF:
 * If a meeting ends at 11:00 and another starts at 11:00:
 * - R_start (11:00) < E_end (11:00) evaluates to 660 < 660 which is FALSE!
 * - Because the condition requires strictly less than (<), the whole expression evaluates to FALSE.
 * - Therefore, back-to-back meetings are ALLOWED without collision!
 */
export function findConflictingBooking(requestedStartTime, requestedEndTime, existingBookings, ignoreBookingId) {
  const reqStart = timeToMinutes(requestedStartTime);
  const reqEnd = timeToMinutes(requestedEndTime);

  for (const existing of existingBookings) {
    const existingId = existing._id ? existing._id.toString() : (existing.id || '');
    if (ignoreBookingId && existingId === ignoreBookingId) {
      continue;
    }

    const exStart = timeToMinutes(existing.startTime);
    const exEnd = timeToMinutes(existing.endTime);

    // Pure mathematical overlap condition for half-open intervals [start, end)
    const isOverlapping = reqStart < exEnd && reqEnd > exStart;

    if (isOverlapping) {
      return existing;
    }
  }

  return null;
}

/**
 * PART B — Next Available Slot Finder Algorithm
 * 
 * Given a room, a date, and a requested duration (in minutes),
 * find the EARLIEST continuous free slot within working hours (09:00 to 18:00).
 */
export function findNextAvailableSlot(existingBookings, roomId, date, durationMinutes) {
  const totalDayCapacity = WORKING_HOURS.END_MINUTES - WORKING_HOURS.START_MINUTES; // 540 minutes

  // Duration validation
  if (!durationMinutes || isNaN(durationMinutes) || durationMinutes <= 0) {
    return {
      available: false,
      roomId,
      date,
      durationMinutes,
      reason: 'Duration must be a positive integer greater than 0 minutes.',
    };
  }

  if (durationMinutes > totalDayCapacity) {
    return {
      available: false,
      roomId,
      date,
      durationMinutes,
      reason: `Requested duration of ${durationMinutes} minutes exceeds the total working day window (${totalDayCapacity} minutes: 09:00 to 18:00).`,
    };
  }

  // 1. Sort bookings chronologically by start time
  const sortedBookings = [...existingBookings]
    .map(b => ({
      ...b,
      startMins: timeToMinutes(b.startTime),
      endMins: timeToMinutes(b.endTime),
    }))
    .sort((a, b) => a.startMins - b.startMins);

  let currentPointer = WORKING_HOURS.START_MINUTES; // 09:00

  // 2. Scan each booking and check interval before it
  for (const booking of sortedBookings) {
    // If the booking starts after current pointer, evaluate the gap
    if (booking.startMins > currentPointer) {
      const freeGap = booking.startMins - currentPointer;
      if (freeGap >= durationMinutes) {
        const slotStart = currentPointer;
        const slotEnd = currentPointer + durationMinutes;
        return {
          available: true,
          roomId,
          date,
          durationMinutes,
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
        };
      }
    }

    // Advance pointer to the end of this booking
    currentPointer = Math.max(currentPointer, booking.endMins);

    // If pointer has already reached or exceeded closing time (18:00), no slots remain
    if (currentPointer >= WORKING_HOURS.END_MINUTES) {
      break;
    }
  }

  // 3. Inspect final gap between last booking and closing time (18:00)
  if (currentPointer < WORKING_HOURS.END_MINUTES) {
    const remainingGap = WORKING_HOURS.END_MINUTES - currentPointer;
    if (remainingGap >= durationMinutes) {
      const slotStart = currentPointer;
      const slotEnd = currentPointer + durationMinutes;
      return {
        available: true,
        roomId,
        date,
        durationMinutes,
        startTime: minutesToTime(slotStart),
        endTime: minutesToTime(slotEnd),
      };
    }
  }

  // 4. No continuous gap of requested duration could be found
  return {
    available: false,
    roomId,
    date,
    durationMinutes,
    reason: `No continuous slot of ${durationMinutes} minutes available within working hours (09:00 - 18:00) on ${date}.`,
  };
}
