"use client";

import { useState, useCallback } from "react";
import type { ToastMessage } from "../types";

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (text: string, type: ToastMessage["type"] = "info", duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 11);
      const newToast: ToastMessage = {
        id,
        text,
        type,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        removeToast(id);
      }, duration);

      return id;
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (text: string, duration?: number) => addToast(text, "success", duration),
    [addToast]
  );

  const error = useCallback(
    (text: string, duration?: number) => addToast(text, "error", duration),
    [addToast]
  );

  const info = useCallback(
    (text: string, duration?: number) => addToast(text, "info", duration),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    info,
  };
} 