"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, variant }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === "error" ? "alert" : "status"}
            className={cn(
              "animate-toast-enter pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-sm shadow-sm",
              toast.variant === "success"
                ? "border-success/30 bg-card text-brown"
                : "border-danger/30 bg-card text-brown",
            )}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0 text-danger" aria-hidden />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Cerrar aviso"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]"
            >
              <X className="h-4 w-4" aria-hidden />
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
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return context;
}
