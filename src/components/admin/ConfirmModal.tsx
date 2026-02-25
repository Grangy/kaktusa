"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Подтвердить",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="rounded-2xl border border-white/15 bg-[#141414] shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-title" className="font-display text-lg font-bold uppercase text-white mb-2">
              {title}
            </h3>
            <p className="text-white/70 text-sm leading-relaxed mb-6">{message}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-white/90 text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  variant === "danger"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[var(--accent)] text-black hover:opacity-90"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
