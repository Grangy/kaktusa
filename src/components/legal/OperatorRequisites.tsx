import { LEGAL_OPERATOR } from "@/lib/legal";

export function OperatorRequisites({ className = "" }: { className?: string }) {
  return (
    <div className={`text-white/60 text-sm space-y-1 ${className}`}>
      <p>{LEGAL_OPERATOR.ipName}</p>
      <p>ОГРНИП {LEGAL_OPERATOR.ogrnip}</p>
      <p>ИНН {LEGAL_OPERATOR.inn}</p>
      <p>
        <a href={`mailto:${LEGAL_OPERATOR.email}`} className="hover:text-[var(--accent)] transition-colors">
          {LEGAL_OPERATOR.email}
        </a>
      </p>
    </div>
  );
}
