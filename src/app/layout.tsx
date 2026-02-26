import type { Metadata } from "next";
import "@fontsource/libre-franklin";
import "@fontsource/libre-franklin/600.css";
import "@fontsource/libre-franklin/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PolygonBackground from "@/components/PolygonBackground";

const SITE_URL = "https://kaktusa.ru";
const defaultTitle = "?КАКТУСА — Электронные ивенты с особым смыслом в Крыму";
const defaultDescription =
  "?КАКТУСА — проект электронных ивентов с особым смыслом и звучанием в уникальных локациях Крыма. Объединяем людей с изысканным музыкальным вкусом.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s | ?КАКТУСА",
  },
  description: defaultDescription,
  keywords: [
    "?КАКТУСА",
    "ивенты Крым",
    "электронные мероприятия",
    "ивенты Ялта",
    "ночные клубы Крым",
    "мероприятия Крым",
  ],
  authors: [{ name: "?КАКТУСА", url: SITE_URL }],
  creator: "?КАКТУСА",
  publisher: "?КАКТУСА",
  formatDetection: { email: false, address: false, telephone: false },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: SITE_URL,
    siteName: "?КАКТУСА",
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: "/intro-poster.jpg", width: 1920, height: 1080, alt: "?КАКТУСА" }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/intro-poster.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" style={{ background: "#000" }}>
      <head>
        <link rel="preload" href="/logo.png" as="image" fetchPriority="high" />
        {/* Критичные стили прелоадера — до загрузки globals.css */}
        <style
          dangerouslySetInnerHTML={{
            __html: `#preloader-shell{position:fixed;inset:0;z-index:999999;background:#000;display:flex;align-items:center;justify-content:center}body.preloader-done #preloader-shell{display:none!important}`,
          }}
        />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] relative" style={{ background: "#000" }}>
        {/* Прелоадер — в первых байтах HTML, до React, до CSS */}
        <div id="preloader-shell" aria-hidden="true">
          <img src="/logo.png" alt="" width={144} height={144} fetchPriority="high" style={{ width: "7rem", height: "7rem", objectFit: "contain" }} />
        </div>
        {/* Скрыть прелоадер на не-главных страницах сразу (без ожидания React) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',h);else h();function h(){if(location.pathname!=='/')document.body.classList.add('preloader-done')}`,
          }}
        />
        <PolygonBackground />
        <div className="relative z-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "?КАКТУСА",
              url: SITE_URL,
              description: defaultDescription,
              inLanguage: "ru",
            }),
          }}
        />
        <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
