"use client";

import { useRef, useMemo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Calendar } from "lucide-react";
import TransitionLink from "./TransitionLink";
import { motion } from "framer-motion";
import type { Event } from "@/types/data";
import { getOptimizedPhotoUrl } from "@/lib/photoUrl";

const DEFAULT_UPCOMING = {
  id: "bloom",
  type: "upcoming" as const,
  title: "BLOOM OF ENERGY",
  date: "28 марта 2026",
  location: "Foster Night Club, Mriya Resort",
  locationShort: "Крым",
  price: "От 3 000 ₽",
  image: "/avisha/IMG_2657.PNG",
  tag: "Ближайшее",
  tagStyle: "bg-purple-500/90 text-white",
  link: "/events/bloom-of-energy",
  linkText: "Купить билет",
};

const DEFAULT_PAST = [
  {
    id: "bal",
    type: "past" as const,
    title: "ТОТ САМЫЙ БАЛ",
    date: "1 ноября 2025",
    location: "Foster Night Club, Mriya Resort",
    locationShort: "Крым",
    image: "/avisha/telegram-cloud-photo-size-2-5415889954678109345-y.jpg",
    tag: "Прошло",
    tagStyle: "bg-gray-600/90 text-white",
    link: "/events/tot-samyj-bal",
    linkText: "Подробнее",
  },
];

type CardEvent = {
  id: string;
  type: "upcoming" | "past";
  title: string;
  date: string;
  location: string;
  locationShort?: string;
  price?: string;
  subtitle?: string;
  image: string;
  tag: string;
  tagStyle: string;
  link: string;
  linkText: string;
};

function toCard(e: Event, type: "upcoming" | "past"): CardEvent {
  return {
    id: e.id,
    type,
    title: e.title,
    date: e.dateDisplay,
    location: e.location,
    locationShort: e.locationShort ?? e.venueCity?.split(",")[0]?.trim() ?? e.location,
    price: type === "upcoming" ? (e.price ?? "От 3 000 ₽") : undefined,
    subtitle: e.subtitle ?? undefined,
    image: e.heroImage,
    tag: type === "upcoming" ? (e.tag ?? "Ближайшее") : "Прошло",
    tagStyle: type === "upcoming" ? (e.tagStyle ?? "bg-purple-500/90 text-white") : "bg-gray-600/90 text-white",
    link: `/events/${e.slug}`,
    linkText: type === "upcoming" ? "Купить билет" : "Подробнее",
  };
}

interface EventsCarouselProps {
  events?: Event[];
}

export default function EventsCarousel({ events }: EventsCarouselProps) {
  const cards = useMemo(() => {
    if (!events?.length) return [DEFAULT_UPCOMING, ...DEFAULT_PAST];
    const upcomingList = events.filter((e) => e.type === "upcoming").sort((a, b) => a.date.localeCompare(b.date));
    const pastList = events.filter((e) => e.type === "past").sort((a, b) => b.date.localeCompare(a.date));
    const upcoming = upcomingList.map((e) => toCard(e, "upcoming"));
    const past = pastList.map((e) => toCard(e, "past"));
    return upcoming.length ? [...upcoming, ...past] : [DEFAULT_UPCOMING, ...past];
  }, [events]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const card = scrollRef.current.querySelector("[data-event-card]");
      const gap = 24;
      const width = (card?.clientWidth ?? 300) + gap;
      scrollRef.current.scrollBy({ left: dir * width, behavior: "smooth" });
    }
  };

  return (
    <section
      id="upcoming"
      className="py-16 md:py-24 px-6 md:px-12 scroll-mt-20 relative overflow-hidden"
      style={{
        background: `
          linear-gradient(135deg, #080908 0%, #0a0c0a 25%, #070806 50%, #090b09 75%, #0b0d0b 100%),
          radial-gradient(ellipse 80% 50% at 20% 20%, rgba(74,222,128,0.04) 0%, transparent 50%),
          radial-gradient(ellipse 60% 80% at 80% 80%, rgba(74,222,128,0.03) 0%, transparent 50%),
          radial-gradient(ellipse 50% 40% at 50% 50%, rgba(74,222,128,0.02) 0%, transparent 70%)
        `,
      }}
    >
      {/* Локальные полигоны поверх глобальных (усиленный акцент секции) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="events-poly-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(74,222,128,0.14)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="events-poly-2" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="rgba(74,222,128,0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="0,0 500,0 300,200 0,150" fill="url(#events-poly-1)" />
          <polygon points="1200,800 700,800 900,500 1200,600" fill="url(#events-poly-2)" />
          <polygon points="600,250 1050,180 1000,450 550,520 200,400" fill="none" stroke="rgba(74,222,128,0.12)" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-x-4 md:inset-x-8 top-8 bottom-8 bg-[var(--accent)]/4 blur-3xl rounded-3xl" />
      </div>
      <div className="relative">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-2xl md:text-4xl font-bold uppercase mb-8 md:mb-10 text-center text-white/95 drop-shadow-sm"
      >
        Мероприятия
      </motion.h2>

      <div className="max-w-5xl mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4 -mx-6 px-6 md:px-0 md:mx-0 scrollbar-hide items-stretch"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {cards.map((event) => (
            <motion.article
              key={event.id}
              data-event-card
              id={event.type === "past" ? "past" : undefined}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[300px] md:w-[320px] snap-center flex"
            >
              <div className="group relative block w-full rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_60px_-8px_rgba(74,222,128,0.25),inset_0_1px_0_rgba(255,255,255,0.05)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30 focus-within:ring-offset-2 focus-within:ring-offset-[#080908] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_4px_24px_-4px_rgba(0,0,0,0.5),0_0_40px_-10px_rgba(74,222,128,0.12),inset_0_1px_0_rgba(255,255,255,0.02)]">
                <TransitionLink
                  href={event.link}
                  className="block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={getOptimizedPhotoUrl(event.image)}
                      alt={event.title}
                      fill
                      sizes="320px"
                      className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <div
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.98)_0%,rgba(0,0,0,0.78)_22%,rgba(0,0,0,0.5)_45%,rgba(0,0,0,0.2)_65%,transparent_80%)]"
                      aria-hidden
                    />
                    <span
                      className={`absolute top-3 right-3 inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider shadow-lg ${event.tagStyle}`}
                    >
                      {event.tag}
                    </span>
                    <div className="absolute bottom-[0.5rem] left-0 right-0 px-3.5 py-3 pb-0 pt-16 space-y-1.5 md:px-3">
                      <h3 className="font-display text-xl font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] group-hover:text-[var(--accent)] transition-colors">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-white/90 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="shrink-0 opacity-70" />
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="shrink-0 opacity-70" />
                          {event.locationShort ?? event.location}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-3">
                        {"price" in event && event.price ? (
                          <p className="text-white text-sm">
                            От <span className="font-bold">{event.price.replace(/^От\s/, "")}</span>
                          </p>
                        ) : event.type === "past" ? (
                          <span className="text-white/70 text-sm font-medium">[DONE]</span>
                        ) : (
                          <span />
                        )}
                        <span className="shrink-0 w-[110px]" />
                      </div>
                    </div>
                  </div>
                </TransitionLink>
                <TransitionLink
                  href={event.type === "upcoming" ? `${event.link}#tickets` : event.link}
                  className={`absolute bottom-3 right-3 inline-flex items-center justify-center py-2.5 px-5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 z-10 ${
                    event.type === "upcoming"
                      ? "border-2 border-[var(--accent)] text-[var(--accent)] bg-black/30 backdrop-blur-sm hover:bg-[var(--accent)]/20"
                      : "border border-white/40 bg-black/20 backdrop-blur-sm text-white hover:bg-white/15 hover:border-white/50"
                  }`}
                >
                  {event.linkText}
                </TransitionLink>
              </div>
            </motion.article>
          ))}
        </div>

        {cards.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => scroll(-1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-white/80 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200 shadow-sm"
              aria-label="Назад"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-11 h-11 flex items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-white/80 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200 shadow-sm"
              aria-label="Вперёд"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      </div>
    </section>
  );
}
