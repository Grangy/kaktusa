"use client";

import Link from "next/link";
import { LEGAL_PATHS } from "@/lib/legal";

type LegalConsentProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  compact?: boolean;
};

export function LegalConsent({ checked, onChange, className = "", compact = false }: LegalConsentProps) {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none text-white/70 ${compact ? "text-xs" : "text-sm"} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[var(--accent)] shrink-0 mt-0.5"
      />
      <span className="leading-relaxed">
        Я принимаю{" "}
        <Link href={LEGAL_PATHS.terms} target="_blank" className="text-[var(--accent)] hover:underline underline-offset-2">
          пользовательское соглашение
        </Link>{" "}
        и даю согласие на обработку персональных данных в соответствии с{" "}
        <Link href={LEGAL_PATHS.privacy} target="_blank" className="text-[var(--accent)] hover:underline underline-offset-2">
          политикой конфиденциальности
        </Link>
        .
      </span>
    </label>
  );
}
