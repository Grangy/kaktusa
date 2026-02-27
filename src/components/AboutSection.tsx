"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Ticket } from "lucide-react";
import Image from "next/image";
import TransitionLink from "./TransitionLink";

const DEFAULT_LINES = [
  "?КАКТУСА — проект, который создаёт электронные ивенты с особым смыслом и звучанием в уникальных локациях Крыма.",
  "?КАКТУСА объединяет людей с изысканным музыкальным вкусом, создавая комьюнити, где музыка, атмосфера и встречи остаются в памяти и манят возвращаться снова и снова.",
];

interface AboutSectionProps {
  about?: { heading: string; lines: string[]; ctaHref: string } | null;
  logo?: string;
}

export default function AboutSection({ about, logo = "/logo.png" }: AboutSectionProps) {
  const heading = about?.heading ?? "О НАС";
  const lines = about?.lines?.length ? about.lines : DEFAULT_LINES;
  const ctaHref = about?.ctaHref ?? "/events/bloom-of-energy#tickets";
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const logoScale = useTransform(scrollYProgress, [0, 0.4, 1], [1.2, 0.85, 0.5]);

  return (
    <section ref={sectionRef} id="about-us" className="py-14 md:py-24 px-6 md:px-12 scroll-mt-20 bg-gradient-to-b from-transparent to-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto w-full"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="font-display text-3xl md:text-4xl font-bold mb-12 text-center"
        >
          {heading}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative w-full overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
            <motion.div
              style={{ scale: logoScale }}
              className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] opacity-[0.10]"
            >
              <Image src={logo} alt="" fill className="object-contain" sizes="448px" />
            </motion.div>
          </div>
          <div className="relative space-y-6 text-left w-full max-w-none">
            {lines.map((text, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="text-white/90 text-base md:text-lg leading-relaxed"
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
            className="relative pt-10 flex justify-center"
          >
            <TransitionLink
              href={ctaHref}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl border-2 border-white/30 font-display text-sm uppercase text-white bg-white/5 backdrop-blur-md hover:bg-white/15 hover:border-white/50 transition-all duration-300"
            >
              <Ticket size={16} /> Купить билет
            </TransitionLink>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
