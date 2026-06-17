import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { termsDocument } from "@/content/legal/terms";

export const metadata: Metadata = {
  title: "Пользовательское соглашение",
  description: "Пользовательское соглашение и условия покупки билетов на kaktusa.ru — ИП Рожков Александр Олегович.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPageShell>
      <LegalDocumentView doc={termsDocument} />
    </LegalPageShell>
  );
}
