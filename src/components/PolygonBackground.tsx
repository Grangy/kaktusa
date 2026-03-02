"use client";

import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Сплошной тёмно-зелёный градиент на весь экран с параллаксом:
 * слой привязан к скроллу и двигается медленнее контента («прилипший» параллакс).
 */
export default function PolygonBackground() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.6, 1], [0.93, 0.96, 0.98, 1]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden>
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full min-h-[200vh] -top-[50vh]"
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(6, 22, 12, 0.98) 0%, rgba(8, 28, 16, 0.96) 25%, rgba(5, 18, 10, 0.98) 50%, rgba(3, 12, 7, 0.99) 75%, rgba(2, 8, 4, 1) 100%)",
          }}
        />
      </motion.div>
      {/* Лёгкий зелёный отблеск для глубины (как было в полигонах) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 1920 1080"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="global-poly-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="global-poly-2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(74,222,128,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon points="0,0 600,0 400,350 0,200" fill="url(#global-poly-1)" />
        <polygon points="1920,1080 1300,1080 1500,700 1920,850" fill="url(#global-poly-2)" />
      </svg>
    </div>
  );
}
