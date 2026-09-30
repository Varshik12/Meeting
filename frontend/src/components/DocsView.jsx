import React from 'react';
import { BookOpen, ExternalLink, Code2, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

export const DocsView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-600 font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Interactive REST API Documentation</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              API Documentation &amp; Specifications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete reference for meeting rooms, conflict-free scheduling, and earliest slot calculation.
            </p>
          </div>
        </div>

        {/* Endpoints overview */}
        <div className="mt-6 space-y-5">
          
          {/* Endpoint 1 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-sky-100 text-sky-800 rounded">
                  GET
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  /api/rooms
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">200 OK</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Returns all pre-seeded meeting rooms with capacities, equipment/amenities, and floor locations.
            </p>
          </div>

          {/* Endpoint 2 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 rounded">
                  POST
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  /api/bookings
                </span>
              </div>
              <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                201 Created · 400 Bad Request · 409 Conflict
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Creates a meeting reservation. Enforces strict working hours (09:00 - 18:00) and detects any overlapping bookings on the same room and date using pure half-open interval math. Back-to-back bookings (e.g., 10:00-11:00 and 11:00-12:00) are strictly allowed.
            </p>
            <div className="mt-2 text-[11px] font-mono text-slate-500 bg-white p-2 rounded border border-slate-200">
              Payload: &#123; roomId, title, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), organizer &#125;
            </div>
          </div>

          {/* Endpoint 3: Part B */}
          <div className="p-4 rounded-lg border border-indigo-100 bg-indigo-50/40">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-sky-100 text-sky-800 rounded">
                  GET
                </span>
                <span className="font-mono text-xs font-semibold text-indigo-950">
                  /api/rooms/:roomId/next-available?date=YYYY-MM-DD&amp;duration=MINUTES
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">200 OK</span>
            </div>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              <strong>Part B — Next Available Slot:</strong> Performs a linear sweep pointer algorithm through working hours (09:00 to 18:00), evaluating gaps before the first booking, between meetings, and after the last meeting. Returns the earliest free window that fits the exact requested duration.
            </p>
          </div>

          {/* Endpoint 4 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-sky-100 text-sky-800 rounded">
                  GET
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  /api/bookings?roomId=...&amp;date=...
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">200 OK</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Returns bookings filtered by room ID and/or date, sorted chronologically.
            </p>
          </div>

          {/* Endpoint 5 */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-rose-100 text-rose-800 rounded">
                  DELETE
                </span>
                <span className="font-mono text-xs font-semibold text-slate-800">
                  /api/bookings/:id
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-semibold">200 OK · 404 Not Found</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Cancels a reservation by its unique identifier.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
