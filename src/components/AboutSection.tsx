"use client";

import { motion } from "framer-motion";
import { Ticket } from "lucide-react";
import TransitionLink from "./TransitionLink";

const DEFAULT_LINES = [
  "?КАКТУСА — проект, который создаёт электронные ивенты с особым смыслом и звучанием в уникальных локациях Крыма.",
  "?КАКТУСА объединяет людей с изысканным музыкальным вкусом, создавая комьюнити, где музыка, атмосфера и встречи остаются в памяти и манят возвращаться снова и снова.",
];

interface AboutSectionProps {
  about?: { heading: string; lines: string[]; ctaHref: string } | null;
}

export default function AboutSection({ about }: AboutSectionProps) {
  const heading = about?.heading ?? "Что такое ?КАКТУСА";
  const lines = about?.lines?.length ? about.lines : DEFAULT_LINES;
  const ctaHref = about?.ctaHref ?? "/events/bloom-of-energy#tickets";

  return (
    <section id="about-us" className="py-14 md:py-24 px-6 md:px-12 scroll-mt-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl md:text-4xl font-bold uppercase mb-12 text-center"
        >
          {heading}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative p-8 md:p-12 border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent backdrop-blur-sm"
        >
          <div className="space-y-6 text-center">
            {lines.map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="text-white/90 text-lg leading-relaxed"
              >
                {text}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-10 flex justify-center"
          >
            <TransitionLink
              href={ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 min-h-[44px] bg-[var(--accent)]/20 border-2 border-[var(--accent)] text-[var(--accent)] font-display text-sm font-semibold uppercase hover:bg-[var(--accent)]/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:ring-offset-black"
            >
              <Ticket size={16} /> Купить билет
            </TransitionLink>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
