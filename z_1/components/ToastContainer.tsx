"use client";

import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToastMessage } from "../types";

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
  className?: string;
}

export function ToastContainer({
  toasts,
  onRemove,
  className,
}: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-50 space-y-2 max-w-sm",
        className
      )}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

function Toast({ toast, onRemove }: ToastProps) {
  const getToastStyles = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-600 text-white";
      case "error":
        return "bg-red-600 text-white";
      case "info":
      default:
        return "bg-primary text-white";
    }
  };

  const getIcon = (type: ToastMessage["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      case "error":
        return <XCircle className="w-5 h-5" />;
      case "info":
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out animate-in slide-in-from-right",
        getToastStyles(toast.type)
      )}
    >
      {getIcon(toast.type)}
      <p className="flex-1 text-sm font-medium">{toast.text}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
