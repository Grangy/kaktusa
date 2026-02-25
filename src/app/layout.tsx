import type { Metadata } from "next";
import "@fontsource/libre-franklin";
import "@fontsource/libre-franklin/600.css";
import "@fontsource/libre-franklin/700.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

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
    <html lang="ru">
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)]">
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
      </body>
    </html>
  );
}
