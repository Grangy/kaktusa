"use client";

import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Variant = "success" | "error" | "warning";

const config = {
  success: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 border-emerald-500/40 text-emerald-200",
    iconClassName: "text-emerald-400",
  },
  error: {
    icon: XCircle,
    className: "bg-red-500/10 border-red-500/40 text-red-200",
    iconClassName: "text-red-400",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-500/10 border-amber-500/40 text-amber-200",
    iconClassName: "text-amber-400",
  },
};

export function AlertBanner({
  variant,
  message,
  onDismiss,
}: {
  variant: Variant;
  message: string;
  onDismiss?: () => void;
}) {
  const { icon: Icon, className, iconClassName } = config[variant];
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${className}`}
      role="alert"
    >
      <Icon size={20} className={`shrink-0 ${iconClassName}`} />
      <p className="text-sm font-medium flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity text-sm"
        >
          Скрыть
        </button>
      )}
    </div>
  );
}
