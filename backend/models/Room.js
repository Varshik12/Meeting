import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    floor: { type: String, required: true, trim: true },
    amenities: [{ type: String }],
    description: { type: String, default: '' },
    color: { type: String, default: '#4f46e5' },
  },
  { timestamps: true }
);

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
