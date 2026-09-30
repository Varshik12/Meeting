import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true, index: true },
    room_id: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },   // HH:mm
    organizer: { type: String, default: 'Team Member' },
    attendeesCount: { type: Number, default: 2 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

bookingSchema.index({ roomId: 1, date: 1 });
bookingSchema.index({ room_id: 1, date: 1 });

bookingSchema.pre('save', function (next) {
  if (this.roomId && !this.room_id) this.room_id = this.roomId;
  if (this.room_id && !this.roomId) this.roomId = this.room_id;
  next();
});

export const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
