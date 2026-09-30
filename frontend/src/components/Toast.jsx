import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = {
      ...toast,
      id,
      timestamp: Date.now(),
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]);

    const timeout = toast.type === 'error' || toast.type === 'warning' ? 6500 : 4500;
    setTimeout(() => {
      removeToast(id);
    }, timeout);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => {
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';
            const isSuccess = toast.type === 'success';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto p-4 rounded-xl border backdrop-blur-md transition-all shadow-xl ${
                  isError
                    ? 'bg-rose-950/95 border-rose-800 text-rose-50 shadow-rose-950/40'
                    : isWarning
                    ? 'bg-amber-950/95 border-amber-700/80 text-amber-50 shadow-amber-950/40'
                    : isSuccess
                    ? 'bg-slate-900/95 border-emerald-500/40 text-white shadow-slate-950/50'
                    : 'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="shrink-0 mt-0.5">
                    {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                    {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                    {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold tracking-wider uppercase font-mono opacity-90">
                        {toast.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                    </div>

                    <p className="mt-1 text-sm leading-relaxed text-slate-200">
                      {toast.message}
                    </p>

                    {toast.conflictingBooking && (
                      <div className="mt-2.5 p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs">
                        <div className="flex items-center justify-between text-rose-300 font-semibold mb-1">
                          <span>Conflicting Reservation</span>
                          <span className="font-mono text-[11px] text-rose-200">
                            {toast.conflictingBooking.startTime} — {toast.conflictingBooking.endTime}
                          </span>
                        </div>
                        <div className="text-slate-300 truncate">
                          "{toast.conflictingBooking.title}"
                        </div>
                        {toast.conflictingBooking.organizer && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Organizer: {toast.conflictingBooking.organizer}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeToast(toast.id)}
                    className="shrink-0 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
