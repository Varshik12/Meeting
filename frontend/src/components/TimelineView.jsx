import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Clock,
  Trash2,
  Calendar,
  X,
  Tv,
  Video,
  Presentation,
  Mic,
  Sparkles,
} from 'lucide-react';

function parseTimeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function formatMinutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const TimelineView = ({
  rooms,
  bookings,
  currentDate,
  onOpenBookingModalWithPrefill,
  onCancelBooking,
  onOpenSlotFinder,
}) => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  const DAY_START = 9 * 60; // 09:00 = 540 mins
  const DAY_END = 18 * 60;  // 18:00 = 1080 mins
  const TOTAL_MINS = DAY_END - DAY_START; // 540 mins

  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

  const renderAmenityIcon = (amenity) => {
    const text = amenity.toLowerCase();
    if (text.includes('display') || text.includes('screen') || text.includes('projector') || text.includes('tv')) {
      return <Tv className="w-3 h-3 text-slate-400" title={amenity} />;
    }
    if (text.includes('camera') || text.includes('video') || text.includes('zoom') || text.includes('panacast')) {
      return <Video className="w-3 h-3 text-slate-400" title={amenity} />;
    }
    if (text.includes('whiteboard') || text.includes('miro') || text.includes('board')) {
      return <Presentation className="w-3 h-3 text-slate-400" title={amenity} />;
    }
    if (text.includes('mic') || text.includes('speak') || text.includes('sound') || text.includes('audio')) {
      return <Mic className="w-3 h-3 text-slate-400" title={amenity} />;
    }
    return <span className="w-1.5 h-1.5 rounded-full bg-slate-300" title={amenity} />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Visual Timeline Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Enterprise Schedule Grid
            </h2>
            <span className="text-[11px] font-mono font-medium text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              09:00 — 18:00
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any open gap to book. Click any reserved block to inspect or cancel.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 border border-indigo-700"></span>
            <span className="font-medium text-slate-700">Reserved Meeting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-100 border border-slate-300"></span>
            <span className="text-slate-500">Free Slot</span>
          </div>
        </div>
      </div>

      {/* Timeline Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px] p-4 sm:p-6">
          
          {/* Header Row: Hours */}
          <div className="flex items-center mb-3 pb-2 border-b border-slate-200 text-xs font-mono text-slate-500">
            <div className="w-64 shrink-0 font-sans font-semibold text-slate-800 text-xs tracking-tight">
              Room &amp; Amenities
            </div>
            <div className="flex-1 grid grid-cols-9 text-center">
              {hours.slice(0, 9).map((hour) => (
                <div key={hour} className="text-left pl-1 border-l border-slate-100">
                  <span className="tabular-nums font-mono font-medium text-slate-600 text-[11px]">
                    {String(hour).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms Rows */}
          {rooms.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No rooms loaded</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No meeting facilities currently available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rooms.map((room) => {
                const roomBookings = bookings.filter(
                  (b) =>
                    (b.roomId === room.id || b.room_id === room.id || b.roomId === room.code) &&
                    b.date === currentDate
                );

                const totalOccupiedMinutes = roomBookings.reduce((sum, b) => {
                  const s = Math.max(DAY_START, parseTimeToMinutes(b.startTime));
                  const e = Math.min(DAY_END, parseTimeToMinutes(b.endTime));
                  return sum + Math.max(0, e - s);
                }, 0);
                const occupancyPct = Math.min(
                  100,
                  Math.round((totalOccupiedMinutes / TOTAL_MINS) * 100)
                );

                return (
                  <div
                    key={room.id}
                    className="flex items-center group py-2 px-2 rounded-xl transition-colors hover:bg-slate-50/80 border border-transparent hover:border-slate-100"
                  >
                    {/* Left Column: Room Identity */}
                    <div className="w-64 shrink-0 pr-4">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-sm font-bold text-slate-900 truncate" title={room.name}>
                          {room.name}
                        </span>
                        {onOpenSlotFinder && (
                          <button
                            onClick={() => onOpenSlotFinder(room.id)}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-0.5 transition-colors"
                            title="Calculate earliest free slot for this room"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            <span>Slot</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                          {room.code}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{room.capacity} seats</span>
                        </span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {occupancyPct}%
                        </span>
                      </div>

                      {/* Amenities Icon Strip */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {room.amenities?.slice(0, 4).map((amenity, i) => (
                          <span
                            key={i}
                            className="p-1 rounded bg-slate-50 border border-slate-200/60 inline-flex items-center"
                            title={amenity}
                          >
                            {renderAmenityIcon(amenity)}
                          </span>
                        ))}
                        {room.amenities?.length > 4 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            +{room.amenities.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Timeline Track */}
                    <div
                      className="flex-1 relative h-14 bg-slate-100/70 rounded-lg border border-slate-200/80 overflow-hidden cursor-crosshair group/track"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const fraction = Math.max(0, Math.min(1, clickX / rect.width));
                        const clickedMinutes = DAY_START + Math.floor(fraction * TOTAL_MINS);
                        const snappedStart = Math.floor(clickedMinutes / 30) * 30;
                        const snappedEnd = Math.min(DAY_END, snappedStart + 60);

                        if (snappedStart < DAY_END) {
                          onOpenBookingModalWithPrefill(
                            room.id,
                            formatMinutesToTime(snappedStart),
                            formatMinutesToTime(snappedEnd)
                          );
                        }
                      }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const fraction = Math.max(0, Math.min(1, clickX / rect.width));
                        const clickedMinutes = DAY_START + Math.floor(fraction * TOTAL_MINS);
                        const snappedStart = Math.floor(clickedMinutes / 30) * 30;
                        const snappedEnd = Math.min(DAY_END, snappedStart + 60);
                        setHoveredSlot({
                          roomId: room.id,
                          start: formatMinutesToTime(snappedStart),
                          end: formatMinutesToTime(snappedEnd),
                        });
                      }}
                      onMouseLeave={() => setHoveredSlot(null)}
                    >
                      {/* Hourly Grid Background Lines */}
                      <div className="absolute inset-0 grid grid-cols-9 divide-x divide-slate-200/60 pointer-events-none">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="h-full" />
                        ))}
                      </div>

                      {/* Bookings positioned inside timeline track */}
                      {roomBookings.map((b) => {
                        const sMins = parseTimeToMinutes(b.startTime);
                        const eMins = parseTimeToMinutes(b.endTime);

                        const clampedStart = Math.max(DAY_START, sMins);
                        const clampedEnd = Math.min(DAY_END, eMins);

                        const leftPercent = ((clampedStart - DAY_START) / TOTAL_MINS) * 100;
                        const widthPercent = Math.max(
                          2,
                          ((clampedEnd - clampedStart) / TOTAL_MINS) * 100
                        );

                        return (
                          <motion.div
                            key={b.id || b._id}
                            initial={{ opacity: 0, scaleY: 0.8 }}
                            animate={{ opacity: 1, scaleY: 1 }}
                            whileHover={{ scale: 1.01, zIndex: 10 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              left: `${leftPercent}%`,
                              width: `${widthPercent}%`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBooking(b);
                            }}
                            className="absolute top-1 bottom-1 rounded-md px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white shadow-xs border border-slate-700/80 overflow-hidden flex flex-col justify-center cursor-pointer select-none transition-all group/item"
                            title={`${b.title} (${b.startTime} - ${b.endTime})\nOrganizer: ${b.organizer}`}
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: room.color || '#3b82f6' }}
                              />
                              <span className="text-[11px] font-semibold truncate leading-tight">
                                {b.title}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-300 font-mono truncate leading-tight tabular-nums mt-0.5">
                              {b.startTime} — {b.endTime} · {b.organizer}
                            </div>
                          </motion.div>
                        );
                      })}

                      {/* Hover Slot Preview Hint */}
                      {hoveredSlot && hoveredSlot.roomId === room.id && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/track:opacity-40 pointer-events-none transition-opacity text-xs font-mono font-medium text-slate-600 bg-indigo-50/20">
                          + Click to book {hoveredSlot.start} — {hoveredSlot.end}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Booking Details Modal Popup */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative"
            >
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Reserved Meeting</span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {selectedBooking.title}
              </h3>

              <div className="mt-4 space-y-2.5 text-sm text-slate-600 border-t border-b border-slate-100 py-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span className="font-semibold text-slate-800 font-mono">{selectedBooking.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-bold text-slate-900 font-mono tabular-nums">
                    {selectedBooking.startTime} — {selectedBooking.endTime}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Room:</span>
                  <span className="font-medium text-slate-800">
                    {rooms.find(r => r.id === selectedBooking.roomId || r.code === selectedBooking.roomId)?.name || selectedBooking.roomId}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Organizer:</span>
                  <span className="font-medium text-slate-800">{selectedBooking.organizer}</span>
                </div>
                {selectedBooking.attendeesCount && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Attendees:</span>
                    <span className="font-medium text-slate-800">{selectedBooking.attendeesCount} people</span>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="pt-1">
                    <span className="text-xs text-slate-400 block mb-0.5">Notes:</span>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {selectedBooking.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idToCancel = selectedBooking.id || selectedBooking._id;
                    if (idToCancel) {
                      onCancelBooking(idToCancel);
                      setSelectedBooking(null);
                    }
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg transition-colors border border-rose-200 hover:border-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Cancel Reservation</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
