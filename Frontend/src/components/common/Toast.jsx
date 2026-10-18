import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-lg shadow-lg text-xs font-semibold border transition-all animate-in slide-in-from-bottom-2 ${
              t.type === 'error'
                ? 'bg-[#faece8] text-[#c26751] border-[#c26751]/30'
                : t.type === 'warning'
                ? 'bg-[#fef9ee] text-[#b08945] border-[#b08945]/30'
                : t.type === 'info'
                ? 'bg-[#ebf1f5] text-[#4a6b82] border-[#4a6b82]/30'
                : 'bg-[#eaf0ee] text-[#52796f] border-[#52796f]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              {t.type === 'error' && <AlertTriangle size={15} className="shrink-0" />}
              {t.type === 'warning' && <AlertTriangle size={15} className="shrink-0" />}
              {t.type === 'info' && <Info size={15} className="shrink-0" />}
              {t.type === 'success' && <CheckCircle2 size={15} className="shrink-0" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: (msg) => console.log('Toast:', msg),
      removeToast: () => {}
    };
  }
  return context;
}

export default ToastProvider;
