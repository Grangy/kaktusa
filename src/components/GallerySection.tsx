"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_PHOTOS = [
  "/photos/DSCF4999.jpg",
  "/photos/0201-31-02DSCF5104.jpg",
  "/photos/DSCF4640.jpg",
  "/photos/0123-20-55DSCF2560.jpg",
  "/photos/DSCF4409.jpg",
  "/photos/DSCF4670.jpg",
  "/photos/0200-07-09DSCF3579.jpg",
  "/photos/0203-09-00DSCF6271.jpg",
];

interface GallerySectionProps {
  photos?: string[] | null;
}

export default function GallerySection({ photos: photosProp }: GallerySectionProps) {
  const photos = photosProp?.length ? photosProp : DEFAULT_PHOTOS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollTo = (index: number) => {
    const i = Math.max(0, Math.min(index, photos.length - 1));
    setActiveIndex(i);
    const el = scrollRef.current?.querySelector(`[data-gallery-item="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  return (
    <section id="gallery" className="py-14 md:py-20 px-6 md:px-12 overflow-hidden scroll-mt-20 bg-gradient-to-b from-[#0c0e0c] to-transparent relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-4 md:inset-x-8 top-8 bottom-8 bg-[var(--accent)]/5 blur-3xl rounded-3xl" />
      </div>
      <div className="relative">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold uppercase mb-10 text-center"
      >
        Галерея
      </motion.h2>

      <div className="relative max-w-5xl mx-auto">
        {/* Карусель */}
        <div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-2 md:-mx-4 px-2 md:px-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onScroll={() => {
            const el = scrollRef.current;
            if (!el) return;
            const index = Math.round(el.scrollLeft / (el.offsetWidth * 0.85 + 16));
            setActiveIndex(Math.min(index, photos.length - 1));
          }}
        >
          {photos.map((src, i) => (
            <motion.div
              key={src}
              data-gallery-item={i}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex-shrink-0 w-[85vw] sm:w-[75vw] md:w-[420px] snap-center group"
            >
              <div className={`relative aspect-[4/5] overflow-hidden rounded-2xl border bg-black/50 shadow-xl shadow-black/50 transition-all duration-300 ${i === activeIndex ? "border-[var(--accent)]/60 shadow-[0_0_30px_-5px_rgba(74,222,128,0.25)]" : "border-white/10 group-hover:border-white/20 group-hover:shadow-[0_0_30px_-5px_rgba(74,222,128,0.2)]"}`}>
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 85vw, (max-width: 768px) 75vw, 420px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Навигация: стрелки + scroll line */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            type="button"
            onClick={() => scrollTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              activeIndex === 0
                ? "border-white/20 text-white/60 hover:bg-white/5"
                : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10"
            }`}
            aria-label="Назад"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 max-w-[200px] h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--accent)] rounded-full"
              style={{ width: `${((activeIndex + 1) / photos.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <button
            type="button"
            onClick={() => scrollTo(activeIndex + 1)}
            disabled={activeIndex === photos.length - 1}
            className={`w-12 h-12 flex items-center justify-center rounded-full border transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
              activeIndex === photos.length - 1
                ? "border-white/20 text-white/60 hover:bg-white/5"
                : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10"
            }`}
            aria-label="Вперёд"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}
