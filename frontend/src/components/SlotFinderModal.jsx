import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Calendar as CalendarIcon,
  ArrowRight,
} from 'lucide-react';
import { fetchNextAvailableSlot } from '../api/api.js';

export const SlotFinderModal = ({
  isOpen,
  onClose,
  rooms,
  selectedRoomId,
  currentDate,
  onSelectSlotToBook,
}) => {
  const [roomId, setRoomId] = useState(selectedRoomId || (rooms[0]?.id ?? ''));
  const [date, setDate] = useState(currentDate || new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const presetDurations = [15, 30, 45, 60, 90, 120];

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!roomId) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchNextAvailableSlot(roomId, date, duration);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to find next available slot.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFoundSlot = () => {
    if (result && result.available && result.startTime && result.endTime) {
      onSelectSlotToBook(result.roomId || roomId, result.date, result.startTime, result.endTime);
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentRoomObj = rooms.find(r => r.id === roomId || r.code === roomId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-xl shadow-2xl border border-slate-200/90 max-w-md w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-indigo-600 tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Availability Engine</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Find Next Available Slot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculates earliest free gap within working hours (09:00 — 18:00).
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          
          {/* Room Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Room
            </label>
            <select
              value={roomId}
              onChange={(e) => {
                setRoomId(e.target.value);
                setResult(null);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code}) · {r.capacity} seats
                </option>
              ))}
            </select>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <div className="relative">
              <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setResult(null);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Meeting Duration
              </label>
              <span className="text-xs font-mono text-slate-800 font-bold">
                {duration} minutes
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {presetDurations.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setDuration(m);
                    setResult(null);
                  }}
                  className={`py-1.5 text-xs font-mono font-medium rounded-md transition-all ${
                    duration === m
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Calculating free intervals...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5 text-slate-300" />
                <span>Search Earliest Opening</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 pt-4 border-t border-slate-100"
            >
              {result.available ? (
                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 font-mono">
                      Earliest Slot Available
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <div className="text-2xl font-bold font-mono tracking-tight text-emerald-900 tabular-nums">
                      {result.startTime} <span className="text-emerald-500 font-sans text-base">→</span> {result.endTime}
                    </div>
                    <span className="text-xs font-mono bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md font-bold">
                      {result.durationMinutes || duration}m window
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-emerald-700">
                    Available in <span className="font-semibold">{currentRoomObj?.name || 'Selected Room'}</span> on {result.date}.
                  </p>

                  <button
                    onClick={handleBookFoundSlot}
                    className="mt-3.5 w-full py-2 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Confirm &amp; Book This Slot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 font-mono">
                      No Continuous Slot Found
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {result.reason || `No contiguous ${duration}-minute block could be found within working hours.`}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
