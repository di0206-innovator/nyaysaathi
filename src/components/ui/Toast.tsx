'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, title: string, message?: string, durationMs?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string, durationMs: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts(prev => [...prev, { id, type, title, message, durationMs }]);

      if (durationMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, durationMs);
      }
    },
    [removeToast]
  );

  // Allow Esc key to dismiss the most recent toast
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[toasts.length - 1].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toasts, removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Accessible Live Region for Screen Readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map(toast => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          const bgBorder = isError
            ? 'bg-red-950/90 border-red-500/50 text-red-200'
            : isSuccess
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            : isWarning
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            : 'bg-slate-900/90 border-slate-700 text-slate-200';

          const icon = isError ? '⚠️' : isSuccess ? '✓' : isWarning ? '⚡' : 'ℹ️';

          return (
            <div
              key={toast.id}
              role={isError ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-200 ${bgBorder}`}
            >
              <span className="text-lg leading-none mt-0.5" aria-hidden="true">
                {icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold tracking-wide text-white">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs mt-1 text-slate-300 break-words">{toast.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside of ToastProvider: graceful degradation without throwing
    return {
      showToast: (_type: ToastType, title: string, message?: string) => {
        if (typeof window !== 'undefined') {
          console.warn(`[Toast fallback]: ${title} ${message || ''}`);
        }
      },
      removeToast: () => {}
    };
  }
  return ctx;
}
