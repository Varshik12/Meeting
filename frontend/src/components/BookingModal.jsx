import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar as CalendarIcon,
  User,
  Users,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { fetchNextAvailableSlot } from '../api/api.js';

export const BookingModal = ({
  isOpen,
  onClose,
  rooms,
  defaultRoomId,
  defaultDate,
  defaultStartTime,
  defaultEndTime,
  onSubmit,
  conflictError,
  isSubmitting,
}) => {
  const [roomId, setRoomId] = useState(defaultRoomId || (rooms[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(defaultStartTime || '10:00');
  const [endTime, setEndTime] = useState(defaultEndTime || '11:00');
  const [organizer, setOrganizer] = useState('');
  const [attendeesCount, setAttendeesCount] = useState(4);
  const [notes, setNotes] = useState('');
  const [clientError, setClientError] = useState(null);
  const [isFindingSlot, setIsFindingSlot] = useState(false);
  const [slotSuggestion, setSlotSuggestion] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultRoomId) setRoomId(defaultRoomId);
      if (defaultDate) setDate(defaultDate);
      if (defaultStartTime) setStartTime(defaultStartTime);
      if (defaultEndTime) setEndTime(defaultEndTime);
      setClientError(null);
      setSlotSuggestion(null);
    }
  }, [isOpen, defaultRoomId, defaultDate, defaultStartTime, defaultEndTime]);

  const applyDuration = (mins) => {
    const [h, m] = startTime.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const totalStart = h * 60 + m;
      const targetEnd = Math.min(18 * 60, totalStart + mins);
      const endH = Math.floor(targetEnd / 60);
      const endM = targetEnd % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    }
  };

  const handleAutoFindSlot = async () => {
    setIsFindingSlot(true);
    setSlotSuggestion(null);
    try {
      const res = await fetchNextAvailableSlot(roomId, date, 45);
      if (res && res.available && res.startTime && res.endTime) {
        setStartTime(res.startTime);
        setEndTime(res.endTime);
        setSlotSuggestion(`Autofilled earliest 45m opening: ${res.startTime} — ${res.endTime}`);
      } else {
        setSlotSuggestion(res.reason || 'No open 45m slots found on this date.');
      }
    } catch {
      setSlotSuggestion('Could not calculate slot.');
    } finally {
      setIsFindingSlot(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setClientError('Meeting title is required.');
      return false;
    }
    if (!date) {
      setClientError('Meeting date is required.');
      return false;
    }

    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = eh * 60 + em;

    if (endMins <= startMins) {
      setClientError('End time must be strictly after start time.');
      return false;
    }
    if (startMins < 9 * 60) {
      setClientError('Start time cannot be before 09:00 (strictly 09:00 - 18:00 window).');
      return false;
    }
    if (endMins > 18 * 60) {
      setClientError('End time cannot exceed 18:00 (strictly 09:00 - 18:00 window).');
      return false;
    }

    setClientError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      roomId,
      title: title.trim(),
      date,
      startTime,
      endTime,
      organizer: organizer.trim() || 'Team Member',
      attendeesCount: Number(attendeesCount) || 2,
      notes: notes.trim(),
    });
  };

  if (!isOpen) return null;

  const selectedRoomObj = rooms.find(r => r.id === roomId || r.code === roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-xl shadow-2xl border border-slate-200/90 max-w-lg w-full p-6 relative my-8"
      >
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-slate-500 tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Workspace Reservation</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Schedule a Meeting Room
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict operations window: <span className="font-mono font-medium text-slate-800">09:00 — 18:00</span>.
          </p>
        </div>

        {/* 409 Conflict Rejection Card */}
        {conflictError && (
          <div className="mb-4 p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-rose-900">409 Conflict Detected</span>
                <span className="text-rose-800 leading-relaxed block mt-0.5">{conflictError}</span>
              </div>
            </div>
          </div>
        )}

        {clientError && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{clientError}</span>
          </div>
        )}

        {slotSuggestion && (
          <div className="mb-4 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{slotSuggestion}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Room Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Meeting Room *
              </label>
              <button
                type="button"
                onClick={handleAutoFindSlot}
                disabled={isFindingSlot}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                title="Calculate earliest 45m opening"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>{isFindingSlot ? 'Scanning...' : 'Find Free Slot'}</span>
              </button>
            </div>

            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code}) — {r.capacity} seats · {r.floor}
                </option>
              ))}
            </select>

            {selectedRoomObj && (
              <div className="mt-1.5 flex flex-wrap gap-1 text-[10px] text-slate-500">
                {selectedRoomObj.amenities?.map((item, i) => (
                  <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Meeting Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Executive Strategy Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time (09:00 - 17:45)
              </label>
              <input
                type="time"
                required
                min="09:00"
                max="17:45"
                step="900"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time (09:15 - 18:00)
              </label>
              <input
                type="time"
                required
                min="09:15"
                max="18:00"
                step="900"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Quick Duration Buttons */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Quick duration:</span>
            {[15, 30, 45, 60, 90].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => applyDuration(mins)}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                +{mins}m
              </button>
            ))}
          </div>

          {/* Organizer & Attendees Count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Organizer
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Attendees
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors font-mono tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Agenda Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Project deck walkthrough, investor Q&A."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Validating Conflicts...</span>
                </>
              ) : (
                <span>Confirm Reservation</span>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
