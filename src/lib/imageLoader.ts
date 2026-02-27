"use client";

/**
 * Кастомный loader для next/image:
 * - /api/photos/* → запрос к нашему API с ?w=&q= (ресайз на сервере через sharp)
 * - остальное → встроенный оптимизатор Next.js
 */
type ImageLoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality = 75 }: ImageLoaderProps): string {
  if (src.startsWith("/api/photos")) {
    const sep = src.includes("?") ? "&" : "?";
    return `${src}${sep}w=${width}&q=${quality}`;
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
