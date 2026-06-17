import type { LegalDocument } from "@/content/legal/types";
import { LEGAL_OPERATOR } from "@/lib/legal";

export function LegalDocumentView({ doc }: { doc: LegalDocument }) {
  return (
    <article className="max-w-3xl mx-auto">
      <header className="mb-10">
        <p className="text-[var(--accent)] text-xs uppercase tracking-[0.2em] mb-3">Юридический документ</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold uppercase text-white mb-4">{doc.title}</h1>
        <p className="text-white/70 text-sm md:text-base leading-relaxed">{doc.subtitle}</p>
        <p className="text-white/45 text-xs mt-4">Редакция от {doc.updatedAt}</p>
      </header>

      <div className="rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md p-6 md:p-10 space-y-10">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75 space-y-1">
          <p className="font-medium text-white">{LEGAL_OPERATOR.ipName}</p>
          <p>ОГРНИП {LEGAL_OPERATOR.ogrnip}</p>
          <p>ИНН {LEGAL_OPERATOR.inn}</p>
          <p>
            Email:{" "}
            <a href={`mailto:${LEGAL_OPERATOR.email}`} className="text-[var(--accent)] hover:underline">
              {LEGAL_OPERATOR.email}
            </a>
          </p>
        </section>

        {doc.sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-28">
            <h2 className="font-display text-lg md:text-xl font-semibold text-white mb-4">{section.title}</h2>
            {section.paragraphs?.map((p, i) => (
              <p key={i} className="text-white/75 text-sm md:text-base leading-relaxed mb-3 last:mb-0">
                {p}
              </p>
            ))}
            {section.list && (
              <ul className="mt-3 space-y-2 list-disc list-outside pl-5 text-white/75 text-sm md:text-base leading-relaxed">
                {section.list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  );
}
