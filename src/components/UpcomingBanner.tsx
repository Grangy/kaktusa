"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import TransitionLink from "./TransitionLink";

export default function UpcomingBanner() {
  return (
    <section id="upcoming" className="py-14 md:py-20 px-6 md:px-12 flex flex-col items-center justify-center scroll-mt-20">
      <div className="max-w-4xl mx-auto w-full flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden group"
        >
          <TransitionLink href="/events/bloom-of-energy" className="block w-full max-w-[280px] md:max-w-[320px] rounded-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-black">
            {/* Картинка 1:1 */}
            <div className="relative aspect-square min-h-[200px] md:min-h-[240px] overflow-hidden">
              <Image
                src="/avisha/IMG_2657.PNG"
                alt="BLOOM OF ENERGY — 28 марта"
                fill
                className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 1024px"
              />
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            {/* Текст снизу на тёмном фоне */}
            <div className="bg-black px-6 py-5 md:px-7 md:py-6 -mt-1">
              <span className="inline-block px-3 py-1 bg-purple-500/90 text-white text-xs font-medium uppercase mb-2">
                Ближайшее мероприятие
              </span>
              <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                BLOOM OF ENERGY
              </h3>
              <p className="text-white/80 text-sm mb-3">28 марта 2026 · Foster Night Club, Mriya Resort</p>
              <span className="inline-block px-6 py-3 min-h-[44px] inline-flex items-center justify-center bg-white text-black font-display text-sm font-semibold uppercase hover:bg-white/90 transition-colors duration-200">
                Купить билет
              </span>
            </div>
          </TransitionLink>
        </motion.div>
      </div>
    </section>
  );
}
