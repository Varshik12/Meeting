import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Users,
  Trash2,
  Filter,
  Plus,
  Search,
  Building2,
} from 'lucide-react';

export const BookingList = ({
  rooms,
  bookings,
  selectedRoomId,
  onSelectRoomId,
  selectedDate,
  onSelectDate,
  onCancelBooking,
  onOpenBookingModal,
}) => {
  const [cancellingId, setCancellingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesRoom =
      selectedRoomId === 'all' ||
      b.roomId === selectedRoomId ||
      b.room_id === selectedRoomId;
    const matchesDate = selectedDate === 'all' || b.date === selectedDate;
    const matchesSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoom && matchesDate && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Filters Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Filter className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Schedule Directory
          </h3>
          <span className="text-xs text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'reservation' : 'reservations'}
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Search Input */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search meetings or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 p-0 text-xs text-slate-800 focus:ring-0 focus:outline-hidden placeholder:text-slate-400 w-36 sm:w-44"
            />
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRoomId}
              onChange={(e) => onSelectRoomId(e.target.value)}
              className="bg-transparent border-0 p-0 text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Rooms ({rooms.length})</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate === 'all' ? '' : selectedDate}
              onChange={(e) => onSelectDate(e.target.value || 'all')}
              className="bg-transparent border-0 p-0 text-xs font-mono font-medium text-slate-800 focus:ring-0 focus:outline-hidden cursor-pointer"
            />
            {selectedDate !== 'all' && (
              <button
                onClick={() => onSelectDate('all')}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold underline ml-1"
              >
                All Dates
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="py-16 text-center px-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400 mb-3">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-semibold text-slate-900">No reservations found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No meeting bookings match your current filter parameters.
          </p>
          <button
            onClick={onOpenBookingModal}
            disabled={rooms.length === 0}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Meeting</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/70 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-semibold">Time Window</th>
                <th className="py-3 px-4 font-semibold">Meeting Subject</th>
                <th className="py-3 px-4 font-semibold">Room Facility</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Organizer</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {filteredBookings.map((b) => {
                  const room = rooms.find(
                    (r) => r.id === b.roomId || r.code === b.roomId || r.id === b.room_id
                  );
                  const bookingId = b.id || b._id || '';

                  return (
                    <motion.tr
                      key={bookingId}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-800 border border-slate-200/60">
                          {b.startTime} — {b.endTime}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {b.title}
                        </div>
                        {b.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                            {b.notes}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {room ? room.name : b.roomId}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          {room?.code || b.roomId} · {room?.floor || 'Floor 3'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                        {b.date}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">{b.organizer}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          <span>{b.attendeesCount || 2} attendees</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {cancellingId === bookingId ? (
                          <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 rounded-md p-1 shadow-2xs">
                            <span className="text-[11px] text-rose-700 font-medium px-1">
                              Cancel?
                            </span>
                            <button
                              onClick={() => {
                                onCancelBooking(bookingId);
                                setCancellingId(null);
                              }}
                              className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setCancellingId(null)}
                              className="px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-200 rounded transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancellingId(bookingId)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
                            title="Cancel this reservation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium hidden sm:inline">Cancel</span>
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
