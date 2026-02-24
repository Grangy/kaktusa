"use client";

import { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import TransitionLink from "./TransitionLink";
import { motion } from "framer-motion";

const UPCOMING = {
  id: "bloom",
  type: "upcoming" as const,
  title: "BLOOM OF ENERGY",
  date: "28 марта 2026",
  location: "Foster Night Club, Mriya Resort",
  price: "От 3 000 ₽",
  image: "/avisha/IMG_2657.PNG",
  tag: "Ближайшее",
  tagStyle: "bg-[var(--accent)]/90 text-black font-semibold",
  link: "/events/bloom-of-energy",
  linkText: "Купить билет",
};

const PAST_EVENTS = [
  {
    id: "bal",
    type: "past" as const,
    title: "ТОТ САМЫЙ БАЛ",
    date: "1 ноября 2025",
    location: "Foster Night Club, Mriya Resort",
    subtitle: "Мастер и Маргарита",
    image: "/avisha/telegram-cloud-photo-size-2-5415889954678109345-y.jpg",
    tag: "Прошло",
    tagStyle: "bg-white/15 text-white/90 border border-white/25",
    link: "/events/tot-samyj-bal",
    linkText: "Подробнее",
  },
];

export default function EventsCarousel() {
  const pastScrollRef = useRef<HTMLDivElement>(null);

  const scrollPast = (dir: number) => {
    if (pastScrollRef.current) {
      const card = pastScrollRef.current.querySelector("[data-event-card]");
      const gap = 24;
      const width = (card?.clientWidth ?? 320) + gap;
      pastScrollRef.current.scrollBy({ left: dir * width, behavior: "smooth" });
    }
  };

  return (
    <section id="upcoming" className="py-16 md:py-24 px-6 md:px-12 scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-2xl md:text-4xl font-bold uppercase mb-4 md:mb-6 text-center"
      >
        Мероприятия
      </motion.h2>

      {/* Ближайшее — один крупный блок */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto mb-16 md:mb-20"
      >
        <TransitionLink
          href={UPCOMING.link}
          className="group block overflow-hidden border-2 border-white/20 hover:border-[var(--accent)]/60 transition-colors duration-300 bg-black"
        >
          <div className="grid md:grid-cols-5 gap-0">
            <div className="relative aspect-[4/3] md:aspect-auto md:col-span-3 md:min-h-[320px]">
              <Image
                src={UPCOMING.image}
                alt={UPCOMING.title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent md:from-transparent md:via-transparent md:to-black/80" />
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className={`inline-flex w-fit px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${UPCOMING.tagStyle}`}>
                  {UPCOMING.tag}
                </span>
                <span className="inline-flex w-fit px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider bg-white/20 text-white">
                  {UPCOMING.date}
                </span>
              </div>
            </div>
            <div className="p-6 md:p-8 flex flex-col justify-center md:col-span-2 bg-black/80">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-3">
                {UPCOMING.title}
              </h3>
              <p className="text-white/80 text-sm flex items-center gap-1.5 mb-2">
                <MapPin size={14} className="opacity-70 shrink-0" /> {UPCOMING.location}
              </p>
              <p className="text-[var(--accent)] font-semibold mb-6">{UPCOMING.price}</p>
              <span className="inline-flex items-center justify-center w-full py-3.5 px-6 text-sm font-semibold uppercase tracking-wider bg-white text-black group-hover:bg-[var(--accent)] group-hover:text-black transition-colors">
                {UPCOMING.linkText}
              </span>
            </div>
          </div>
        </TransitionLink>
      </motion.div>

      {/* Прошедшие — отдельный подзаголовок и карусель */}
      <motion.h3
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-lg md:text-xl font-semibold uppercase text-white/70 mb-6 text-center"
      >
        Прошедшие
      </motion.h3>

      <div className="max-w-5xl mx-auto">
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center justify-items-center">
          {PAST_EVENTS.map((event) => (
            <motion.article
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              id="past"
              className="w-full max-w-[320px]"
            >
              <TransitionLink
                href={event.link}
                className="group block rounded-none overflow-hidden bg-black border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="320px"
                    className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className={`inline-flex w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-none ${event.tagStyle}`}>
                      {event.tag}
                    </span>
                    <span className="inline-flex w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-none bg-white/20 text-white">
                      {event.date}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-display text-lg font-bold text-white mb-1.5">{event.title}</h4>
                  <p className="text-white/70 text-xs flex items-center gap-1 mb-2">
                    <MapPin size={12} className="opacity-70 shrink-0" /> {event.location}
                  </p>
                  {event.subtitle && (
                    <p className="text-white/50 text-xs mb-3">{event.subtitle}</p>
                  )}
                  <span className="inline-flex items-center justify-center w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider border-2 border-[var(--accent)] text-[var(--accent)] group-hover:bg-[var(--accent)]/10 transition-colors">
                    {event.linkText}
                  </span>
                </div>
              </TransitionLink>
            </motion.article>
          ))}
        </div>

        {/* Mobile: карусель прошедших */}
        <div className="md:hidden relative">
          <div
            ref={pastScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 -mx-6 px-6 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {PAST_EVENTS.map((event) => (
              <article
                key={event.id}
                id="past"
                data-event-card
                className="flex-shrink-0 w-[280px] snap-center"
              >
                <TransitionLink
                  href={event.link}
                  className="group block rounded-none overflow-hidden bg-black border border-white/10"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="280px"
                      className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      <span className={`inline-flex w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-none ${event.tagStyle}`}>
                        {event.tag}
                      </span>
                      <span className="inline-flex w-fit px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-none bg-white/20 text-white">
                        {event.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-display text-lg font-bold text-white mb-1.5">{event.title}</h4>
                    <p className="text-white/70 text-xs flex items-center gap-1 mb-2">
                      <MapPin size={12} className="opacity-70 shrink-0" /> {event.location}
                    </p>
                    {event.subtitle && (
                      <p className="text-white/50 text-xs mb-3">{event.subtitle}</p>
                    )}
                    <span className="inline-flex items-center justify-center w-full py-3 px-4 text-xs font-semibold uppercase tracking-wider border-2 border-[var(--accent)] text-[var(--accent)]">
                      {event.linkText}
                    </span>
                  </div>
                </TransitionLink>
              </article>
            ))}
          </div>
          {PAST_EVENTS.length > 1 && (
            <>
              <button
                onClick={() => scrollPast(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-none bg-black/70 border border-white/20 text-white z-10"
                aria-label="Назад"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scrollPast(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-none bg-black/70 border border-white/20 text-white z-10"
                aria-label="Вперёд"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
