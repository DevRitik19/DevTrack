import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let borderClass = 'border-[#E3D5BD] bg-white';
          let icon = <Info className="w-5 h-5 text-[#B65F3B] shrink-0" />;

          if (toast.type === 'success') {
            borderClass = 'border-[#BDD6B7] bg-[#FAFDF9]';
            icon = <CheckCircle2 className="w-5 h-5 text-[#263524] shrink-0" />;
          } else if (toast.type === 'error') {
            borderClass = 'border-[#F3CECB] bg-[#FDFBFB]';
            icon = <AlertCircle className="w-5 h-5 text-[#C24137] shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 ${borderClass} border rounded-lg shadow-lg text-sm text-[#292C25] animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              {icon}
              <div className="flex-1 text-xs leading-relaxed font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-secondary hover:text-[#263524] p-0.5 rounded transition-colors"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
