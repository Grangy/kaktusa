import type { Metadata } from "next";
import "@fontsource/libre-franklin";
import "@fontsource/libre-franklin/600.css";
import "@fontsource/libre-franklin/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://kaktusa.ru"),
  title: "?КАКТУСА — Электронные ивенты с особым смыслом в Крыму",
  description: "?КАКТУСА — проект электронных ивентов с особым смыслом и звучанием в уникальных локациях Крыма. Объединяем людей с изысканным музыкальным вкусом.",
  alternates: { canonical: "https://kaktusa.ru" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
