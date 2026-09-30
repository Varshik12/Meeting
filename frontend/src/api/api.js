/**
 * Centralized API Client Service for Meeting Room Booking System
 * 
 * ALL backend API calls (rooms, bookings, conflict checking, next available slot)
 * are centralized here. Components import and invoke functions from this file.
 */

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }
  return '/api';
};

const API_BASE = getApiBaseUrl();

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new ApiError(
        json.error || `Request failed with status ${res.status}`,
        res.status,
        json
      );
    }

    return json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Network error occurred. Please check backend server connection.',
      500,
      null
    );
  }
}

/**
 * Fetch all meeting rooms
 */
export async function fetchRooms() {
  const json = await request('/rooms');
  return json.data || [];
}

/**
 * Create a new custom meeting room
 */
export async function createRoom(data) {
  const json = await request('/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json.data;
}

/**
 * Delete a meeting room by ID
 */
export async function deleteRoom(roomId) {
  const json = await request(`/rooms/${roomId}`, {
    method: 'DELETE',
  });
  return json.data;
}

/**
 * Seed standard default meeting rooms
 */
export async function seedDefaultRooms() {
  const json = await request('/rooms/seed', {
    method: 'POST',
  });
  return json.data;
}

/**
 * Clear all bookings (reset application data)
 */
export async function clearAllData() {
  await request('/rooms/clear-all', {
    method: 'POST',
  });
}

/**
 * Fetch bookings filtered by room ID and/or date
 */
export async function fetchBookings(roomId, date) {
  const params = new URLSearchParams();
  if (roomId && roomId !== 'all') {
    params.set('roomId', roomId);
  }
  if (date && date !== 'all') {
    params.set('date', date);
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const json = await request(`/bookings${queryString}`);
  return json.data || [];
}

/**
 * Create a new meeting room reservation (Triggers Part A Conflict Detection)
 */
export async function createBooking(bookingData) {
  const json = await request('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
  return json.data;
}

/**
 * Cancel an existing booking by ID
 */
export async function cancelBooking(bookingId) {
  const json = await request(`/bookings/${bookingId}`, {
    method: 'DELETE',
  });
  return json.data;
}

/**
 * Calculate the next available contiguous slot for a room and date (Part B)
 */
export async function fetchNextAvailableSlot(roomId, date, durationMinutes) {
  const params = new URLSearchParams({
    date,
    duration: durationMinutes.toString(),
  });

  const json = await request(`/rooms/${roomId}/next-available?${params.toString()}`);
  return json;
}
