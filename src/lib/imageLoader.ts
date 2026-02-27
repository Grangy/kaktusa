"use client";

/**
 * Кастомный loader для next/image:
 * - /api/photos/* → наш API с ?w=&q= (ресайз через sharp)
 * - остальные локальные пути (/) → как есть (standalone не отдаёт /_next/image, 404)
 * - внешние URL → как есть (браузер грузит напрямую)
 */
type ImageLoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  if (src.startsWith("/api/photos")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=${quality}`;
  }
  // Локальные пути: в standalone /_next/image даёт 404 — отдаём путь как есть, статика из public/
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }
  return src;
}
