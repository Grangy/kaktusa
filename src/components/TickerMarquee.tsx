"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

const tickerItems = [
  "10% от стоимости каждого билета будет перечислен в фонд «Линия жизни»",
  "?КАКТУСА",
  "Ивенты с любовью в шипах",
];

export default function TickerMarquee() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="fixed left-0 right-0 bottom-0 z-[80] py-3 border-t border-white/10 overflow-hidden bg-black/70 backdrop-blur-md"
    >
      <div className="flex overflow-hidden w-full">
        <motion.div
          animate={{ x: ["0%", "-33.333%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex shrink-0 gap-16"
          style={{ width: "max-content" }}
        >
          {[...tickerItems, ...tickerItems, ...tickerItems].map((item, i) => (
            <span
              key={i}
              className="font-display text-sm md:text-base whitespace-nowrap tracking-[0.22em] text-white/90 uppercase"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
