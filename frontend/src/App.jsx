import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './components/Toast.jsx';
import { Navbar } from './components/Navbar.jsx';
import { TimelineView } from './components/TimelineView.jsx';
import { BookingList } from './components/BookingList.jsx';
import { RoomCard } from './components/RoomCard.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { SlotFinderModal } from './components/SlotFinderModal.jsx';
import {
  fetchRooms,
  fetchBookings,
  createBooking,
  cancelBooking,
  ApiError,
} from './api/api.js';
import {
  AlertCircle,
  RefreshCw,
  Building2,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
} from 'lucide-react';

function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function MainDashboard() {
  const { addToast } = useToast();

  // App State: 5 pre-seeded enterprise rooms
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [currentDate, setCurrentDate] = useState(getTodayString());
  const [selectedRoomFilter, setSelectedRoomFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'bookings' | 'rooms'

  // Loading & error states
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Modal states
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSlotFinderOpen, setIsSlotFinderOpen] = useState(false);
  const [slotFinderRoomId, setSlotFinderRoomId] = useState('');

  // Pre-fill state for booking modal
  const [prefillData, setPrefillData] = useState({});

  const [conflictError, setConflictError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial Data Loading
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [roomsData, bookingsData] = await Promise.all([
        fetchRooms(),
        fetchBookings(selectedRoomFilter, currentDate),
      ]);
      setRooms(roomsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error('Data load error:', err);
      setFetchError(err.message || 'Failed to load booking system data.');
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Could not connect to backend server. Please verify API status.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, selectedRoomFilter, addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open booking modal with prefill
  const handleOpenBookingModal = (roomId, startTime, endTime) => {
    setConflictError(null);
    setPrefillData({
      roomId: roomId || (rooms[0]?.id ?? ''),
      date: currentDate,
      startTime: startTime || '10:00',
      endTime: endTime || '11:00',
    });
    setIsBookingModalOpen(true);
  };

  // Open slot finder modal (Part B)
  const handleOpenSlotFinder = (roomId) => {
    setSlotFinderRoomId(roomId || (rooms[0]?.id ?? ''));
    setIsSlotFinderOpen(true);
  };

  // Select slot from Part B modal and trigger reservation
  const handleSelectSlotToBook = (rId, dDate, sTime, eTime) => {
    setConflictError(null);
    setPrefillData({
      roomId: rId,
      date: dDate,
      startTime: sTime,
      endTime: eTime,
    });
    setIsBookingModalOpen(true);
  };

  // Create booking handler (Part A Conflict Detection)
  const handleCreateBooking = async (data) => {
    setIsSubmitting(true);
    setConflictError(null);

    try {
      const newBooking = await createBooking(data);

      addToast({
        type: 'success',
        title: 'Reservation Confirmed',
        message: `"${newBooking.title}" booked for ${newBooking.startTime} — ${newBooking.endTime} on ${newBooking.date}.`,
      });

      setIsBookingModalOpen(false);
      const updatedBookings = await fetchBookings(selectedRoomFilter, currentDate);
      setBookings(updatedBookings);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setConflictError(err.message);
        addToast({
          type: 'warning',
          title: '409 Conflict Detected',
          message: err.message,
          conflictingBooking: err.data?.conflictingBooking,
        });
      } else {
        setConflictError(err.message || 'An error occurred while booking.');
        addToast({
          type: 'error',
          title: 'Booking Rejected',
          message: err.message || 'Failed to submit reservation.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel booking handler
  const handleCancelBooking = async (bookingId) => {
    try {
      const deleted = await cancelBooking(bookingId);
      addToast({
        type: 'info',
        title: 'Reservation Cancelled',
        message: `Meeting "${deleted.title}" (${deleted.startTime} — ${deleted.endTime}) has been removed.`,
      });

      const updatedBookings = await fetchBookings(selectedRoomFilter, currentDate);
      setBookings(updatedBookings);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message || 'Could not cancel booking.',
      });
    }
  };

  // Calculate summary metrics
  const bookingsToday = bookings.filter(b => b.date === currentDate);
  const totalSlotsMinutes = rooms.length * (9 * 60);
  const bookedMinutesToday = bookingsToday.reduce((sum, b) => {
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    const s = Math.max(9 * 60, sh * 60 + sm);
    const e = Math.min(18 * 60, eh * 60 + em);
    return sum + Math.max(0, e - s);
  }, 0);
  const occupancyPercent = totalSlotsMinutes > 0 ? Math.round((bookedMinutesToday / totalSlotsMinutes) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-sans">
      {/* Top Enterprise Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenSlotFinder={() => handleOpenSlotFinder()}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        roomCount={rooms.length}
      />

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Metric Summary Bar */}
        <section className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3.5">
          
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Rooms Available
              </span>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {rooms.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Pre-seeded</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Scheduled Today
              </span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {bookingsToday.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">Reservations</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Facility Occupancy
              </span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {occupancyPercent}%
              </span>
              <span className="text-xs text-slate-500 font-medium">of 09:00 — 18:00</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                Working Window
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold font-mono text-slate-900">
                09:00 — 18:00
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70">
                Enforced
              </span>
            </div>
          </div>

        </section>

        {/* Fetch Error Banner */}
        {fetchError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={loadData}
              className="px-3 py-1 bg-white border border-rose-200 text-rose-700 font-semibold rounded-md hover:bg-rose-100 flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto mb-6"></div>
            <div className="space-y-3">
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          </div>
        )}

        {/* Tab 1: Timeline Grid Matrix */}
        {!isLoading && activeTab === 'schedule' && (
          <section className="space-y-6">
            <TimelineView
              rooms={rooms}
              bookings={bookings}
              currentDate={currentDate}
              onOpenBookingModalWithPrefill={handleOpenBookingModal}
              onCancelBooking={handleCancelBooking}
              onOpenSlotFinder={handleOpenSlotFinder}
            />
          </section>
        )}

        {/* Tab 2: Bookings List View */}
        {!isLoading && activeTab === 'bookings' && (
          <section>
            <BookingList
              rooms={rooms}
              bookings={bookings}
              selectedRoomId={selectedRoomFilter}
              onSelectRoomId={setSelectedRoomFilter}
              selectedDate={currentDate}
              onSelectDate={setCurrentDate}
              onCancelBooking={handleCancelBooking}
              onOpenBookingModal={() => handleOpenBookingModal()}
            />
          </section>
        )}

        {/* Tab 3: Rooms Directory */}
        {!isLoading && activeTab === 'rooms' && (
          <section>
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Conference &amp; Huddle Rooms
                </h3>
                <p className="text-xs text-slate-500">
                  Pre-configured enterprise meeting facilities with hardware &amp; video conferencing specs.
                </p>
              </div>

              <button
                onClick={() => handleOpenBookingModal()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Reserve Room</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => {
                const roomBookingsToday = bookings.filter(
                  (b) =>
                    (b.roomId === room.id || b.room_id === room.id || b.roomId === room.code) &&
                    b.date === currentDate
                );

                return (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onSelectRoom={(id) => handleOpenBookingModal(id)}
                    onFindSlot={(id) => handleOpenSlotFinder(id)}
                    bookingCountToday={roomBookingsToday.length}
                  />
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        rooms={rooms}
        defaultRoomId={prefillData.roomId}
        defaultDate={prefillData.date}
        defaultStartTime={prefillData.startTime}
        defaultEndTime={prefillData.endTime}
        onSubmit={handleCreateBooking}
        conflictError={conflictError}
        isSubmitting={isSubmitting}
      />

      {/* Part B: Next Available Slot Modal */}
      <SlotFinderModal
        isOpen={isSlotFinderOpen}
        onClose={() => setIsSlotFinderOpen(false)}
        rooms={rooms}
        selectedRoomId={slotFinderRoomId}
        currentDate={currentDate}
        onSelectSlotToBook={handleSelectSlotToBook}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainDashboard />
    </ToastProvider>
  );
}
