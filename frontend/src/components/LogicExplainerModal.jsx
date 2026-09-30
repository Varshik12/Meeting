import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Copy, Code2, ShieldCheck } from 'lucide-react';

export const LogicExplainerModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('conflict');
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!isOpen) return null;

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlBookExample = `curl -X POST http://localhost:5000/api/bookings \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "room-pod-a",
    "title": "Strategy Sync",
    "date": "2026-09-30",
    "startTime": "10:00",
    "endTime": "11:00",
    "organizer": "Jane Doe",
    "attendeesCount": 5
  }'`;

  const curlConflictExample = `curl -X POST http://localhost:5000/api/bookings \\
  -H "Content-Type: application/json" \\
  -d '{
    "roomId": "room-pod-a",
    "title": "Overlapping Sync",
    "date": "2026-09-30",
    "startTime": "10:30",
    "endTime": "11:30"
  }'

# Response: 409 Conflict
# {
#   "success": false,
#   "error": "Conflict detected: Requested time 10:30-11:30 overlaps with existing booking \\"Strategy Sync\\" (10:00-11:00) in Innovation Pod A.",
#   "conflictingBooking": { "title": "Strategy Sync", "startTime": "10:00", "endTime": "11:00" }
# }`;

  const curlSlotExample = `curl "http://localhost:5000/api/rooms/room-pod-a/next-available?date=2026-09-30&duration=45"

# Response: 200 OK
# {
#   "success": true,
#   "available": true,
#   "roomId": "room-pod-a",
#   "date": "2026-09-30",
#   "durationMinutes": 45,
#   "startTime": "11:00",
#   "endTime": "11:45"
# }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors hover:bg-slate-100"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-indigo-600 tracking-wider">
            <Code2 className="w-3.5 h-3.5" />
            <span>Architecture &amp; Logic Specifications</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Booking Engine Mathematical Proof &amp; Algorithms
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pure JavaScript implementation without external scheduling libraries.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200/80 mb-5">
          <button
            onClick={() => setActiveTab('conflict')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'conflict'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Part A: Conflict Math &amp; Back-to-Back Rule
          </button>
          <button
            onClick={() => setActiveTab('slot')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'slot'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Part B: Earliest Slot Finder Algorithm
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'curl'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            REST API &amp; cURL Verification
          </button>
        </div>

        {/* Tab 1: Conflict Detection */}
        {activeTab === 'conflict' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200">
              <h4 className="font-bold text-indigo-900 text-sm mb-1">
                Interval Overlap Condition
              </h4>
              <p className="leading-relaxed">
                For half-open intervals <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-700">[ReqStart, ReqEnd)</code> and{' '}
                <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-700">[ExStart, ExEnd)</code>, overlap occurs if and only if:
              </p>
              <div className="my-2 p-2.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-md">
                ReqStart &lt; ExEnd &amp;&amp; ReqEnd &gt; ExStart
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <h5 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Back-to-Back Rule (Allowed)
                </h5>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>
                    Existing: <span className="font-mono text-slate-800">10:00 - 11:00</span>
                  </li>
                  <li>
                    Requested: <span className="font-mono text-slate-800">11:00 - 12:00</span>
                  </li>
                  <li>
                    Formula evaluates: <code className="font-mono text-slate-800">11:00 &lt; 11:00</code> is{' '}
                    <span className="font-bold text-emerald-700">FALSE</span>.
                  </li>
                  <li className="text-emerald-700 font-medium">Result: Clear, no collision!</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <h5 className="font-semibold text-slate-900 mb-1.5 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Detected Collisions (HTTP 409)
                </h5>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Partial Start: 09:30-10:30 overlaps 10:00-11:00</li>
                  <li>Partial End: 10:30-11:30 overlaps 10:00-11:00</li>
                  <li>Sub-interval: 10:15-10:45 inside 10:00-11:00</li>
                  <li>Super-interval: 09:00-12:00 covers 10:00-11:00</li>
                  <li>Identical: 10:00-11:00 == 10:00-11:00</li>
                </ul>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <h5 className="font-semibold text-slate-900 mb-1">
                Strict Working Hours Constraints (09:00 - 18:00)
              </h5>
              <p className="text-slate-600 leading-relaxed">
                Requests starting before 09:00 (540 minutes), ending after 18:00 (1080 minutes), or where <code className="font-mono">endTime &le; startTime</code> are immediately rejected with <span className="font-mono font-semibold text-rose-600">400 Bad Request</span> before DB querying.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Next Available Slot */}
        {activeTab === 'slot' && (
          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 rounded-lg bg-indigo-50/70 border border-indigo-200">
              <h4 className="font-bold text-indigo-900 text-sm mb-1">
                Linear Sweep Pointer Algorithm
              </h4>
              <p className="leading-relaxed">
                Finds the earliest continuous free window of requested duration in minutes within 09:00 to 18:00.
              </p>
            </div>

            <ol className="space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-lg border border-slate-200 leading-relaxed">
              <li>
                <strong className="text-slate-900">Query &amp; Sort:</strong> Fetch existing bookings for specified room and date; sort ascending by start time in minutes.
              </li>
              <li>
                <strong className="text-slate-900">Initialize Pointer:</strong> Set <code className="font-mono font-semibold text-indigo-700">currentPointer = 540</code> (09:00).
              </li>
              <li>
                <strong className="text-slate-900">Check Inter-Booking Gaps:</strong> For each booking:
                <div className="pl-5 pt-1 text-slate-600">
                  <code className="font-mono">gap = booking.startMinutes - currentPointer</code>
                  <br />
                  If <code className="font-mono">gap &ge; duration</code>: <strong>Earliest slot found!</strong> Return <code className="font-mono">[currentPointer, currentPointer + duration]</code>.
                  <br />
                  Else: Advance pointer to <code className="font-mono">max(currentPointer, booking.endMinutes)</code>.
                </div>
              </li>
              <li>
                <strong className="text-slate-900">Check Remaining Day Window:</strong> If pointer &lt; 1080 (18:00):
                <div className="pl-5 pt-1 text-slate-600">
                  <code className="font-mono">remainingGap = 1080 - currentPointer</code>
                  <br />
                  If <code className="font-mono">remainingGap &ge; duration</code>: Return <code className="font-mono">[currentPointer, currentPointer + duration]</code>.
                </div>
              </li>
              <li>
                <strong className="text-slate-900">No Free Slot:</strong> If no gap fits the duration, return <code className="font-mono font-semibold">available: false</code> with descriptive reason.
              </li>
            </ol>
          </div>
        )}

        {/* Tab 3: cURL & API Reference */}
        {activeTab === 'curl' && (
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">1. Create Booking (POST /api/bookings)</span>
                <button
                  onClick={() => copyToClipboard(curlBookExample, 1)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                {curlBookExample}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">2. Conflict Detection Test (Returns 409 Conflict)</span>
                <button
                  onClick={() => copyToClipboard(curlConflictExample, 2)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 2 ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                {curlConflictExample}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-800">3. Next Available Slot (GET /api/rooms/:id/next-available)</span>
                <button
                  onClick={() => copyToClipboard(curlSlotExample, 3)}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                >
                  {copiedIndex === 3 ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 3 ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                {curlSlotExample}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
