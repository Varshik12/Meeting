import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { isDbConnected } from '../config/db.js';

// Pre-seeded enterprise rooms dataset
export const INITIAL_ROOMS = [
  {
    id: 'room-boardroom-alpha',
    name: 'Executive Boardroom',
    code: 'ROOM-EXEC',
    capacity: 16,
    floor: 'Floor 4 — Executive Wing',
    amenities: ['Dual 85" 4K Displays', 'Poly Studio 4K', 'Glass Whiteboard', 'Conference Speakerphone'],
    description: 'Flagship boardroom engineered for executive leadership syncs, investor briefings, and high-stakes hybrid meetings.',
    color: '#4f46e5',
  },
  {
    id: 'room-pod-a',
    name: 'Innovation Pod A',
    code: 'ROOM-POD-A',
    capacity: 6,
    floor: 'Floor 3 — Engineering Wing',
    amenities: ['65" 4K Display', 'Jabra Speak 750', 'Whiteboard', 'AirPlay / Cast'],
    description: 'High-velocity sprint pod configured for rapid team standups, architecture pairing, and cross-functional whiteboarding.',
    color: '#0284c7',
  },
  {
    id: 'room-pod-b',
    name: 'Innovation Pod B',
    code: 'ROOM-POD-B',
    capacity: 6,
    floor: 'Floor 3 — Engineering Wing',
    amenities: ['65" 4K Display', 'Logitech MeetUp', 'Glass Whiteboard'],
    description: 'Collaborative pod for breakout sessions and design discussions.',
    color: '#0d9488',
  },
  {
    id: 'room-turing',
    name: 'Turing Design Studio',
    code: 'ROOM-TURING',
    capacity: 10,
    floor: 'Floor 2 — Product Lab',
    amenities: ['Dual Monitors', 'Digital Miro Board', 'Ergonomic Seating'],
    description: 'Dynamic product lab optimized for product design reviews, technical demos, and live usability walkthroughs.',
    color: '#7c3aed',
  },
  {
    id: 'room-apollo',
    name: 'Apollo Conference Hall',
    code: 'ROOM-APOLLO',
    capacity: 24,
    floor: 'Floor 1 — Main Level',
    amenities: ['Laser 4K Projector', 'Dolby Audio', 'Wireless Stage Mics'],
    description: 'Large hall for company all-hands, department town halls, and major team workshops.',
    color: '#ea580c',
  },
];

// In-memory collections (for fallback when Atlas is not configured)
let memoryRooms = [];
let memoryBookings = [];

export async function initStorage() {
  if (isDbConnected()) {
    try {
      const roomCount = await Room.countDocuments();
      if (roomCount === 0) {
        console.log('🌱 [Seed] Pre-seeding 5 meeting rooms into MongoDB Atlas...');
        for (const r of INITIAL_ROOMS) {
          await Room.create({
            _id: r.id,
            name: r.name,
            code: r.code,
            capacity: r.capacity,
            floor: r.floor,
            amenities: r.amenities,
            description: r.description,
            color: r.color,
          });
        }
      }
      return;
    } catch (err) {
      console.warn('⚠️ [Seed] MongoDB seed check failed:', err.message);
    }
  }

  if (memoryRooms.length === 0) {
    memoryRooms = INITIAL_ROOMS.map(r => ({ ...r, _id: r.id }));
    memoryBookings = [];
    console.log(`🌱 [Seed] Pre-seeded ${memoryRooms.length} meeting rooms into memory store.`);
  }
}

// Room Operations
export async function getAllRooms() {
  if (isDbConnected()) {
    try {
      const rooms = await Room.find().sort({ code: 1 }).lean();
      return rooms.map(r => ({
        ...r,
        id: r._id ? r._id.toString() : r.id,
      }));
    } catch (err) {
      console.warn('Falling back to memory rooms due to DB error');
    }
  }
  return [...memoryRooms];
}

export async function findRoomById(roomId) {
  if (!roomId) return null;
  const cleanId = String(roomId).trim();
  if (isDbConnected()) {
    try {
      const room = await Room.findOne({
        $or: [{ _id: cleanId }, { code: cleanId.toUpperCase() }, { id: cleanId }],
      }).lean();
      if (room) {
        return { ...room, id: room._id ? room._id.toString() : room.id };
      }
    } catch (err) {
      console.warn('Falling back to memory room due to DB error');
    }
  }
  return memoryRooms.find(r => r.id === cleanId || r._id === cleanId || r.code === cleanId.toUpperCase()) || null;
}

export async function insertRoom(data) {
  const cleanCode = data.code.trim().toUpperCase();

  const existing = await findRoomById(cleanCode);
  if (existing) {
    throw new Error(`Room code "${cleanCode}" already exists. Please choose a unique room code.`);
  }

  const payload = {
    name: data.name.trim(),
    code: cleanCode,
    capacity: Number(data.capacity) || 4,
    floor: data.floor.trim(),
    amenities: data.amenities || [],
    description: data.description?.trim() || '',
    color: data.color || '#4f46e5',
  };

  if (isDbConnected()) {
    try {
      const created = await Room.create(payload);
      const json = created.toJSON();
      return { ...json, id: json._id.toString() };
    } catch (err) {
      console.warn('DB room insert failed, writing to memory store:', err.message);
    }
  }

  const newId = `room-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
  const memoryDoc = {
    ...payload,
    id: newId,
    _id: newId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryRooms.push(memoryDoc);
  return memoryDoc;
}

export async function deleteRoomById(roomId) {
  if (isDbConnected()) {
    try {
      const deleted = await Room.findByIdAndDelete(roomId).lean();
      if (deleted) {
        await Booking.deleteMany({ $or: [{ roomId }, { room_id: roomId }] });
        return { ...deleted, id: deleted._id.toString() };
      }
    } catch (err) {
      console.warn('DB delete room failed, trying memory store:', err);
    }
  }

  const index = memoryRooms.findIndex(r => r.id === roomId || r._id === roomId || r.code === roomId);
  if (index !== -1) {
    const [deleted] = memoryRooms.splice(index, 1);
    memoryBookings = memoryBookings.filter(b => b.roomId !== deleted.id && b.room_id !== deleted.id && b.roomId !== deleted.code);
    return deleted;
  }

  return null;
}

export async function seedDefaultRooms() {
  const seeded = [];
  for (const r of INITIAL_ROOMS) {
    const existing = await findRoomById(r.code);
    if (!existing) {
      const created = await insertRoom(r);
      seeded.push(created);
    }
  }
  return seeded;
}

export async function clearAllBookings() {
  if (isDbConnected()) {
    try {
      await Booking.deleteMany({});
    } catch (err) {
      console.warn('DB clear bookings failed:', err);
    }
  }
  memoryBookings = [];
}

// Booking Operations
export async function getBookingsByFilter(filters) {
  if (isDbConnected()) {
    try {
      const query = {};
      if (filters.roomId) {
        query.$or = [{ roomId: filters.roomId }, { room_id: filters.roomId }];
      }
      if (filters.date) {
        query.date = filters.date;
      }
      const docs = await Booking.find(query).sort({ startTime: 1 }).lean();
      return docs.map(b => ({
        ...b,
        id: b._id.toString(),
      }));
    } catch (err) {
      console.warn('Falling back to memory bookings due to DB error');
    }
  }

  let results = [...memoryBookings];
  if (filters.roomId) {
    results = results.filter(b => b.roomId === filters.roomId || b.room_id === filters.roomId);
  }
  if (filters.date) {
    results = results.filter(b => b.date === filters.date);
  }

  return results.sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function insertBooking(data) {
  const payload = {
    roomId: data.roomId,
    room_id: data.roomId,
    title: data.title.trim(),
    date: data.date.trim(),
    startTime: data.startTime.trim(),
    endTime: data.endTime.trim(),
    organizer: data.organizer?.trim() || 'Team Member',
    attendeesCount: Number(data.attendeesCount) || 2,
    notes: data.notes?.trim() || '',
  };

  if (isDbConnected()) {
    try {
      const created = await Booking.create(payload);
      const json = created.toJSON();
      return { ...json, id: json._id.toString() };
    } catch (err) {
      console.warn('DB insert failed, writing to memory store:', err);
    }
  }

  const newId = `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const memoryDoc = {
    ...payload,
    id: newId,
    _id: newId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  memoryBookings.push(memoryDoc);
  return memoryDoc;
}

export async function deleteBookingById(bookingId) {
  if (isDbConnected()) {
    try {
      const deleted = await Booking.findByIdAndDelete(bookingId).lean();
      if (deleted) {
        return { ...deleted, id: deleted._id.toString() };
      }
    } catch (err) {
      console.warn('DB delete failed, trying memory store:', err);
    }
  }

  const index = memoryBookings.findIndex(b => b.id === bookingId || b._id === bookingId);
  if (index !== -1) {
    const [deleted] = memoryBookings.splice(index, 1);
    return deleted;
  }

  return null;
}
