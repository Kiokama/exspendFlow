import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastCard: React.FC<{ toast: ToastItem; onClose: () => void }> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-rose-500 flex-shrink-0" />;
    }
  };

  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-emerald-500/30 dark:border-emerald-500/20",
          bg: "bg-white/95 dark:bg-gray-900/95 shadow-emerald-500/10",
          bar: "bg-emerald-500",
          badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
        };
      case "error":
        return {
          border: "border-rose-500/30 dark:border-rose-500/20",
          bg: "bg-white/95 dark:bg-gray-900/95 shadow-rose-500/10",
          bar: "bg-rose-500",
          badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
        };
      case "warning":
        return {
          border: "border-amber-500/30 dark:border-amber-500/20",
          bg: "bg-white/95 dark:bg-gray-900/95 shadow-amber-500/10",
          bar: "bg-amber-500",
          badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
        };
      case "info":
      default:
        return {
          border: "border-rose-500/30 dark:border-rose-500/20",
          bg: "bg-white/95 dark:bg-gray-900/95 shadow-rose-500/10",
          bar: "bg-rose-500",
          badge: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
        };
    }
  };

  const style = getStyle();
  const duration = toast.duration || 4000;

  return (
    <div
      className={`relative overflow-hidden group flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-lg ${style.bg} ${style.border} transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 sm:slide-in-from-right-4 max-w-md w-full pointer-events-auto`}
    >
      <div className={`p-2 rounded-xl ${style.badge}`}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
          {toast.title}
        </h4>
        {toast.message && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed break-words">
            {toast.message}
          </p>
        )}
      </div>

      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        aria-label="Đóng thông báo"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Dynamic Animated Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full ${style.bar} transition-all ease-linear`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
};

const ToastContainer: React.FC<{ toasts: ToastItem[]; removeToast: (id: string) => void }> = ({
  toasts,
  removeToast
}) => {
  return (
    <div
      aria-live="assertive"
      className="fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastItem, "id">) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastItem = { ...toast, id };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showSuccess = useCallback((title: string, message?: string) => {
    showToast({ type: "success", title, message });
  }, [showToast]);

  const showError = useCallback((title: string, message?: string) => {
    showToast({ type: "error", title, message });
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string) => {
    showToast({ type: "info", title, message });
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string) => {
    showToast({ type: "warning", title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, showToast, showSuccess, showError, showInfo, showWarning, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
