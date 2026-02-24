"use client";

import { motion } from "framer-motion";

const news = [
  {
    id: 1,
    date: "24.02.2025",
    title: "BLOOM OF ENERGY — анонс",
    excerpt: "Анонсируем нашу весеннюю вечеринку в Mriya Resort с WILYAMDELOVE & NOBE",
  },
  {
    id: 2,
    date: "20.02.2025",
    title: "Новые локации в Крыму",
    excerpt: "Расширяем географию — готовим сюрпризы в лучших местах полуострова",
  },
  {
    id: 3,
    date: "15.02.2025",
    title: "Bassmatic Records в Крыму",
    excerpt: "Впервые на нашем мероприятии — основатели легендарного лейбла",
  },
];

export default function NewsSection() {
  return (
    <section id="news" className="py-20 md:py-28 px-6 md:px-12 bg-black/30">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase mb-12 text-center"
      >
        Новости
      </motion.h2>

      <div className="max-w-4xl mx-auto space-y-6">
        {news.map((item, i) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ x: 8 }}
            className="group p-6 border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
          >
            <p className="text-[var(--accent)] text-sm tracking-wider mb-2">{item.date}</p>
            <h3 className="font-display text-xl font-semibold tracking-wide text-white mb-2 group-hover:text-[var(--accent)] transition-colors">
              {item.title}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">{item.excerpt}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
