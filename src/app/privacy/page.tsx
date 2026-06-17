import type { Metadata } from "next";
import { LegalPageShell } from "@/components/legal/LegalPageShell";
import { LegalDocumentView } from "@/components/legal/LegalDocumentView";
import { privacyPolicyDocument } from "@/content/legal/privacy-policy";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика обработки персональных данных сайта kaktusa.ru — ИП Рожков Александр Олегович.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell>
      <LegalDocumentView doc={privacyPolicyDocument} />
    </LegalPageShell>
  );
}
