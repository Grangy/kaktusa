"use client";

import { useMemo, useState } from "react";
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
const DURATION = 60; // секунд на один полный круг

export default function ReviewsSection({ reviews: reviewsProp }: ReviewsSectionProps) {
  const reviews = reviewsProp?.length ? reviewsProp : DEFAULT_REVIEWS;
  const [paused, setPaused] = useState(false);

  // Тройное повторение для бесшовного бесконечного скролла
  const repeated = useMemo(
    () => [...reviews, ...reviews, ...reviews],
    [reviews]
  );

  const oneSetWidth = reviews.length * (CARD_WIDTH + GAP) - GAP;

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
        className="relative w-full"
        style={{ maskImage: "linear-gradient(to right, transparent, black 6%, black 94%, transparent)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div
          className="flex gap-6 py-2 w-max"
          style={{ width: "max-content" }}
          animate={{ x: [0, -oneSetWidth] }}
          transition={{
            x: {
              duration: paused ? 1e6 : DURATION,
              repeat: Infinity,
              repeatType: "loop",
              ease: "linear",
            },
          }}
        >
          {repeated.map((review, i) => (
            <motion.div
              key={`${review.id}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] p-6 border border-white/10 bg-white/5 hover:border-white/20 transition-colors duration-200 min-h-[140px] flex flex-col"
            >
              <p className="text-white/90 text-sm leading-relaxed mb-4 flex-1">&ldquo;{review.text}&rdquo;</p>
              <p className="text-[var(--accent)] text-xs uppercase">{review.author}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
