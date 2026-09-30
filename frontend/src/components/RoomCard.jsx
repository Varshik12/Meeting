import React from 'react';
import {
  Users,
  MapPin,
  Plus,
  Sparkles,
  Tv,
  Video,
  Presentation,
  Mic,
  Check,
} from 'lucide-react';

export const RoomCard = ({
  room,
  onSelectRoom,
  onFindSlot,
  bookingCountToday,
}) => {
  const renderAmenityIcon = (amenity) => {
    const text = amenity.toLowerCase();
    if (text.includes('display') || text.includes('screen') || text.includes('projector') || text.includes('tv')) {
      return <Tv className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (text.includes('camera') || text.includes('video') || text.includes('zoom') || text.includes('panacast')) {
      return <Video className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (text.includes('whiteboard') || text.includes('miro') || text.includes('board')) {
      return <Presentation className="w-3.5 h-3.5 text-slate-500" />;
    }
    if (text.includes('mic') || text.includes('speak') || text.includes('sound') || text.includes('audio')) {
      return <Mic className="w-3.5 h-3.5 text-slate-500" />;
    }
    return <Check className="w-3.5 h-3.5 text-emerald-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: room.color || '#3b82f6' }} />
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                {room.code}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
              {room.name}
            </h3>
          </div>

          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
            {bookingCountToday} {bookingCountToday === 1 ? 'meeting' : 'meetings'} today
          </span>
        </div>

        {/* Location & Capacity */}
        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800">{room.capacity} seats</span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{room.floor}</span>
          </span>
        </div>

        {/* Description */}
        {room.description && (
          <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
            {room.description}
          </p>
        )}

        {/* Amenities breakdown */}
        {room.amenities && room.amenities.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Facility Equipment
            </span>
            <div className="flex flex-wrap gap-1.5">
              {room.amenities.map((item, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-slate-50 text-slate-700 border border-slate-200/70 rounded-md px-2 py-1 inline-flex items-center gap-1.5"
                >
                  {renderAmenityIcon(item)}
                  <span>{item}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
        {onFindSlot && (
          <button
            onClick={() => onFindSlot(room.id)}
            className="py-2 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            title="Calculate earliest free slot in this room"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next Slot</span>
          </button>
        )}

        <button
          onClick={() => onSelectRoom(room.id)}
          className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5 text-slate-300" />
          <span>Book Room</span>
        </button>
      </div>
    </div>
  );
};
