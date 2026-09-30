import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Building2,
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenBookingModal,
  onOpenSlotFinder,
  currentDate,
  onDateChange,
  roomCount,
}) => {
  const formatDateLabel = (dateStr) => {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    const yStr = date.getFullYear();
    const mStr = String(date.getMonth() + 1).padStart(2, '0');
    const dStr = String(date.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const handleToday = () => {
    const now = new Date();
    const yStr = now.getFullYear();
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const dStr = String(now.getDate()).padStart(2, '0');
    onDateChange(`${yStr}-${mStr}-${dStr}`);
  };

  const isToday = () => {
    const now = new Date();
    const yStr = now.getFullYear();
    const mStr = String(now.getMonth() + 1).padStart(2, '0');
    const dStr = String(now.getDate()).padStart(2, '0');
    return currentDate === `${yStr}-${mStr}-${dStr}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Enterprise Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  Workspace
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  Rooms
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono tracking-tight block">
                09:00 — 18:00 Enterprise Schedule
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Switcher */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
              <span>Timeline Matrix</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'bookings'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-slate-500" />
              <span>Bookings List</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'rooms'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
              <span>Rooms ({roomCount})</span>
            </button>
          </nav>

          {/* Zone 3: Date Navigator & Primary CTA */}
          <div className="flex items-center gap-3">
            
            {/* Quick Date Navigator */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-2xs divide-x divide-slate-100">
              <button
                onClick={handlePrevDay}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-l-lg transition-colors"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-800 font-mono whitespace-nowrap">
                  {formatDateLabel(currentDate)}
                </span>
                {!isToday() && (
                  <button
                    onClick={handleToday}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline transition-colors"
                  >
                    Today
                  </button>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-r-lg transition-colors"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Slot Finder CTA */}
            {onOpenSlotFinder && (
              <button
                onClick={onOpenSlotFinder}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors shadow-2xs"
                title="Find earliest available meeting slot"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Next Slot</span>
              </button>
            )}

            {/* Primary Action: Book Room */}
            <button
              onClick={onOpenBookingModal}
              disabled={roomCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4 text-slate-300" />
              <span>Book Room</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
