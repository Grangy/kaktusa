"use client";

import { motion } from "framer-motion";

const tickerItems = [
  "BLOOM OF ENERGY",
  "28 МАРТА",
  "Mriya Resort",
  "Ивенты с любовью в шипах",
  "Foster Night Club",
  "WILYAMDELOVE & NOBE",
  "Bassmatic Records",
  "?КАКТУСА",
  "Премиум вечеринки Крым",
  "Где энергия встречает весну",
];

export default function TickerMarquee() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-6 border-y border-white/10 overflow-hidden bg-black/30"
    >
      <div className="flex overflow-hidden w-full">
        <motion.div
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="flex shrink-0 gap-16"
          style={{ width: "max-content" }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="font-display text-xl md:text-2xl whitespace-nowrap tracking-[0.2em] text-white/90"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
