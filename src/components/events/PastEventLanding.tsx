"use client";

import { useRef } from "react";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import { MapPin, Calendar, Clock, Users } from "lucide-react";

const artists = [
  "GRETTA",
  "MARGARYAN",
  "DOBROV & GAR1SSON (Moscow)",
  "RESONANCE",
  "TITORENKO",
];

export default function PastEventLanding() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [0, 120, 320]);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <motion.div style={{ y }} className="absolute inset-0 -top-[25%] -bottom-[25%]">
            <Image
              src="/avisha/telegram-cloud-photo-size-2-5415889954678109345-y.jpg"
              alt="ТОТ САМЫЙ БАЛ"
              fill
              className="object-cover opacity-55"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/45 to-black/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(0,0,0,0.85),rgba(0,0,0,0.4)_60%,transparent_85%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_15%,rgba(0,0,0,0.5)_35%,rgba(0,0,0,0.5)_65%,transparent_85%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1 mb-6 bg-white/10 text-white/90 text-xs font-medium tracking-wide uppercase border border-white/20"
          >
            Прошло
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold  uppercase mb-4"
          >
            ТОТ САМЫЙ БАЛ
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60 text-sm  uppercase"
          >
            1.11. | Mriya Resort | Ноябрь 2025
          </motion.p>
        </div>
      </section>

      {/* When & Location */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left"
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-4">Когда</h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <Calendar size={18} />
              <span>1 ноября 2025</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 mt-2">
              <Clock size={18} />
              <span>22:00</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center md:text-left"
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-4">Локация</h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <MapPin size={18} />
              <span>Foster Night Club</span>
            </div>
            <p className="text-white/70 text-sm mt-2">Mriya Resort, Крым</p>
          </motion.div>
        </div>
      </section>

      {/* Event Details */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-black/50">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold  uppercase mb-8"
          >
            О мероприятии
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/90 text-lg leading-relaxed mb-6"
          >
            В ночь, когда оживают самые смелые фантазии, двери ночного клуба Foster распахнулись для того самого бала.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/80 text-lg leading-relaxed mb-6"
          >
            Роскошь, искушение и музыка переплелись в один единый поток, напоминая страницы романа М. Булгакова «Мастер и Маргарита».
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm mb-10"
          >
            Музыкальную магию сотворили D&G (Dobrov & Gar1sson) — московский дуэт, образованный в 2019 году двумя диджеями с международным опытом. Pablo Dobrov и Gar1sson выступали на лучших площадках России, Европы, Индии и Таиланда. Их стиль — энергичное сочетание progressive, electronic, house и techno, заряжающее публику драйвом и эмоциями.
          </motion.p>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-sm  uppercase text-white/50 mb-4"
          >
            Артисты
          </motion.h3>
          <ul className="space-y-3">
            {artists.map((artist, i) => (
              <motion.li
                key={artist}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="font-display text-white tracking-wider flex items-center gap-2"
              >
                <span className="text-[var(--accent)]">◦</span> {artist}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Venue */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold  uppercase mb-6"
          >
            Локация
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <h4 className="font-display text-lg tracking-wide">Foster Night Club</h4>
            <p className="text-white/70">Mriya Resort</p>
            <p className="text-white/50 text-sm">Крым, Россия</p>
          </motion.div>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-black/50">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-2">Возраст</h3>
            <p className="flex items-center gap-2 text-white">
              <Users size={18} /> 18+
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-2">Тема</h3>
            <p className="text-white/80 italic">Мастер и Маргарита</p>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <TransitionLink
              href="/#events"
              className="inline-block px-8 py-3 border-2 border-white/30 text-white/90 font-display text-sm uppercase  hover:bg-white/10 transition-colors"
            >
              Другие тусы
            </TransitionLink>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-xl tracking-wide text-white/90"
          >
            Ивенты с любовью в шипах
          </motion.p>
          <TransitionLink
            href="/"
            className="inline-block font-display text-2xl font-bold  uppercase text-white hover:text-[var(--accent)] transition-colors"
          >
            ?КАКТУСА
          </TransitionLink>
        </div>
      </section>
    </main>
  );
}
