"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

const config = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-500/15 border-emerald-500/50 text-emerald-200",
    iconClassName: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    className: "bg-red-500/15 border-red-500/50 text-red-200",
    iconClassName: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-500/15 border-amber-500/50 text-amber-200",
    iconClassName: "text-amber-400",
  },
};

export function Toast({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const { type, message } = item;
  const { icon: Icon, className, iconClassName } = config[type];

  useEffect(() => {
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24 }}
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm ${className}`}
    >
      <Icon size={22} className={`shrink-0 mt-0.5 ${iconClassName}`} />
      <p className="text-sm font-medium flex-1 pr-2">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-80 hover:opacity-100"
        aria-label="Закрыть"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, remove }: { toasts: ToastItem[]; remove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => (
            <Toast key={item.id} item={item} onDismiss={() => remove(item.id)} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
