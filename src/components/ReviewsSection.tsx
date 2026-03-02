"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

const DEFAULT_REVIEWS = [
  { id: 1, text: "Невероятная атмосфера! Музыка и локация на высшем уровне. Обязательно вернёмся.", author: "Гость BLOOM" },
  { id: 2, text: "Ивенты ?КАКТУСА — это не просто вечеринки, это путешествие. Каждый раз что-то новое.", author: "Участник" },
  { id: 3, text: "Уникальный формат. Комьюнити, которое понимает настоящую электронную музыку.", author: "DJ" },
];

interface ReviewsSectionProps {
  reviews?: Array<{ id: number; text: string; author: string }> | null;
}

const CARD_WIDTH = 320;
const GAP = 24;
const DURATION = 60;

export default function ReviewsSection({ reviews: reviewsProp }: ReviewsSectionProps) {
  const reviews = reviewsProp?.length ? reviewsProp : DEFAULT_REVIEWS;
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const repeated = useMemo(
    () => [...reviews, ...reviews, ...reviews],
    [reviews]
  );

  const oneSetWidth = reviews.length * (CARD_WIDTH + GAP) - GAP;

  // Автоскролл только когда не в паузе (hover/scroll)
  useEffect(() => {
    if (paused) return;
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const step = (oneSetWidth / DURATION) * dt;
      el.scrollLeft += step;
      if (el.scrollLeft >= oneSetWidth) el.scrollLeft -= oneSetWidth;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [paused, oneSetWidth]);

  const handleInteract = useCallback(() => setPaused(true), []);
  const handleLeave = useCallback(() => setPaused(false), []);

  // Колёсико мыши → горизонтальный скролл только при Shift+колесо (не блокируем вертикальный скролл страницы)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.shiftKey && e.deltaY !== 0) {
        e.preventDefault();
        handleInteract();
        el.scrollLeft += e.deltaY;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [handleInteract]);

  return (
    <section id="reviews" className="py-14 md:py-20 overflow-hidden scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold uppercase mb-10 text-center px-6"
      >
        Отзывы
      </motion.h2>

      <div
        ref={scrollRef}
        className="flex gap-6 py-2 overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory scrollbar-hide px-6 md:px-12"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        onMouseEnter={handleInteract}
        onMouseLeave={handleLeave}
        onTouchStart={handleInteract}
        onTouchEnd={() => setTimeout(handleLeave, 200)}
      >
        {repeated.map((review, i) => (
          <motion.div
            key={`${review.id}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] p-6 rounded-2xl bg-white/5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),0_0_14px_-1px_rgba(145,145,145,0.67)] hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_20px_-2px_rgba(145,145,145,0.7)] transition-all duration-200 min-h-[140px] flex flex-col snap-center"
          >
            <p className="text-white/90 text-sm leading-relaxed mb-4 flex-1">&ldquo;{review.text}&rdquo;</p>
            <p className="text-[var(--accent)] text-xs uppercase">{review.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
