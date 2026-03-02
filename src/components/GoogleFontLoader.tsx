"use client";

import { useEffect } from "react";

/**
 * Подключает Google Font по ссылке прогрессивно:
 * - стили загружаются асинхронно (media="print" → "all"), не блокируют рендер
 * - после загрузки применяется --font-sans для всего сайта
 */
export function GoogleFontLoader({
  href,
  fontFamily,
}: {
  href: string;
  fontFamily?: string;
}) {
  useEffect(() => {
    if (!href) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.media = "print"; // не блокирует рендер
    link.onload = () => {
      link.media = "all";
      if (fontFamily) {
        document.documentElement.style.setProperty(
          "--font-sans",
          `'${fontFamily.replace(/'/g, "\\'")}', system-ui, sans-serif`
        );
        document.documentElement.style.setProperty(
          "--font-display",
          `'${fontFamily.replace(/'/g, "\\'")}', system-ui, sans-serif`
        );
      }
    };
    document.head.appendChild(link);
    return () => {
      link.remove();
      if (fontFamily) {
        document.documentElement.style.removeProperty("--font-sans");
        document.documentElement.style.removeProperty("--font-display");
      }
    };
  }, [href, fontFamily]);

  return null;
}
