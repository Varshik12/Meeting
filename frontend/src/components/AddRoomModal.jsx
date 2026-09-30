import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, DoorOpen, Users, MapPin, Check } from 'lucide-react';

const PRESET_AMENITIES = [
  '85" 4K Display',
  '65" 4K Display',
  'Video Conferencing',
  'Glass Whiteboard',
  'Jabra Speakerphone',
  'Dual Monitors',
  'Apple TV / AirPlay',
  'Laser Projector',
  'Acoustic Paneling',
];

const PRESET_COLORS = [
  '#4f46e5',
  '#0284c7',
  '#0d9488',
  '#7c3aed',
  '#ea580c',
  '#e11d48',
  '#059669',
];

export const AddRoomModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [floor, setFloor] = useState('Floor 2');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([
    '65" 4K Display',
    'Glass Whiteboard',
  ]);
  const [customAmenity, setCustomAmenity] = useState('');
  const [color, setColor] = useState('#4f46e5');
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const toggleAmenity = (item) => {
    setSelectedAmenities(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const addCustomAmenity = () => {
    if (customAmenity.trim() && !selectedAmenities.includes(customAmenity.trim())) {
      setSelectedAmenities(prev => [...prev, customAmenity.trim()]);
      setCustomAmenity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Room name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Room code is required.');
      return;
    }
    if (capacity < 1) {
      setError('Capacity must be at least 1 person.');
      return;
    }
    if (!floor.trim()) {
      setError('Floor / location is required.');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        capacity: Number(capacity),
        floor: floor.trim(),
        amenities: selectedAmenities,
        description: description.trim(),
        color,
      });
      setName('');
      setCode('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Failed to create room.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
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

        <div className="mb-5">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-indigo-600 tracking-wider">
            <DoorOpen className="w-3.5 h-3.5" />
            <span>Facility Management</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Add New Meeting Room
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define room dimensions, seating capacity, equipment, and unique identifier.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Room Name & Code */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Conference Room A"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CONF-A"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
              />
            </div>
          </div>

          {/* Capacity & Floor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Seating Capacity *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={capacity}
                  onChange={e => setCapacity(parseInt(e.target.value, 10) || 1)}
                  className="w-full pl-9 pr-3 py-2 text-sm font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Floor / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Floor 3, North Wing"
                  value={floor}
                  onChange={e => setFloor(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Room Amenities &amp; Equipment
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_AMENITIES.map(item => {
                const isSelected = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-medium'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-indigo-600" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="+ Add custom amenity"
                value={customAmenity}
                onChange={e => setCustomAmenity(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:bg-white focus:border-indigo-400 outline-hidden"
              />
              <button
                type="button"
                onClick={addCustomAmenity}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Spacious boardroom for client presentations and all-hands..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-colors resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                  }`}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg transition-all shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Creating Room...</span>
                </>
              ) : (
                <span>Save Room</span>
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
