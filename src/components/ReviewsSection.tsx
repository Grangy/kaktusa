"use client";

import { motion } from "framer-motion";

const reviews = [
  {
    id: 1,
    text: "Невероятная атмосфера! Музыка и локация на высшем уровне. Обязательно вернёмся.",
    author: "Гость BLOOM",
  },
  {
    id: 2,
    text: "Ивенты ?КАКТУСА — это не просто вечеринки, это путешествие. Каждый раз что-то новое.",
    author: "Участник",
  },
  {
    id: 3,
    text: "Уникальный формат. Комьюнити, которое понимает настоящую электронную музыку.",
    author: "DJ",
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-14 md:py-20 px-6 md:px-12 scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold uppercase mb-10 text-center"
      >
        Отзывы
      </motion.h2>

      <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
        {reviews.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            className="p-6 border border-white/10 bg-white/5 rounded-none hover:border-white/20 transition-colors duration-200"
          >
            <p className="text-white/90 text-sm leading-relaxed mb-5">&ldquo;{review.text}&rdquo;</p>
            <p className="text-[var(--accent)] text-xs uppercase">{review.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
