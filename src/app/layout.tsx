import type { Metadata } from "next";
import "@fontsource/libre-franklin";
import "@fontsource/libre-franklin/600.css";
import "@fontsource/libre-franklin/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import PolygonBackground from "@/components/PolygonBackground";
import PreloaderShell from "@/components/PreloaderShell";
import { getMainSafe, getMetaSafe } from "@/lib/data";
import { GoogleFontLoader } from "@/components/GoogleFontLoader";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [main, meta] = await Promise.all([getMainSafe(), getMetaSafe()]);
  const logoScrolled = main?.hero?.logoScrolled ?? "/logo.png";
  const logoHero = main?.hero?.logoHero ?? "/new-logo.png";
  // Для дефолтного лого — облегчённая версия (6KB vs 323KB)
  const preloaderLogo = logoScrolled === "/logo.png" ? "/logo-preloader.png" : logoScrolled;
  const googleFontUrl = meta?.googleFontUrl?.trim() || undefined;
  const fontFamily = meta?.fontFamily?.trim() || undefined;

  return (
    <html lang="ru" style={{ background: "transparent" }}>
      <head>
        {googleFontUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          </>
        )}
        <link rel="preload" href={preloaderLogo} as="image" fetchPriority="high" />
        {logoScrolled !== "/logo.png" && <link rel="preload" href={logoScrolled} as="image" />}
        {/* Критичные стили прелоадера — до загрузки globals.css */}
        <style
          dangerouslySetInnerHTML={{
            __html: `#preloader-shell{position:fixed;inset:0;z-index:999999;background:#000;display:flex;align-items:center;justify-content:center}#preloader-shell.preloader-done{display:none!important}`,
          }}
        />
      </head>
      <body className="antialiased bg-transparent text-[var(--foreground)] relative">
        {googleFontUrl && <GoogleFontLoader href={googleFontUrl} fontFamily={fontFamily} />}
        <PreloaderShell preloaderLogo={preloaderLogo} />
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
        <Providers logo={{ logoHero, logoScrolled }}>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
