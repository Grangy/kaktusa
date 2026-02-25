"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ToastItem, ToastType } from "./Toast";
import { ToastContainer } from "./Toast";

type AddToast = (type: ToastType, message: string) => void;

const ToastContext = createContext<AddToast | null>(null);

export function useToast(): AddToast {
  const add = useContext(ToastContext);
  if (!add) throw new Error("useToast must be used within AdminToastProvider");
  return add;
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}
