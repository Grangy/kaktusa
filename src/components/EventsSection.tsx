"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { getOptimizedPhotoUrl } from "@/lib/photoUrl";

const events = [
  {
    id: "bloom",
    type: "upcoming",
    title: "BLOOM OF ENERGY",
    date: "28 марта",
    dateFull: "28 марта 2026",
    location: "Foster Night Club | Mriya Resort",
    price: "От 2 500 ₽",
    image: "/avisha/IMG_2657.PNG",
    tag: "FEATURED",
    tagStyle: "bg-purple-500/90",
    link: "/events/bloom-of-energy",
    linkText: "Купить билет",
    gradient: "from-black via-black/80 to-transparent",
    muted: false,
  },
  {
    id: "bal",
    type: "past",
    title: "ТОТ САМЫЙ БАЛ",
    date: "1 ноября 2025",
    location: "Foster Night Club | Mriya Resort",
    image: "/avisha/telegram-cloud-photo-size-2-5415889954678109345-y.jpg",
    tag: "Прошло",
    tagStyle: "bg-white/5 border border-white/10 text-white/70",
    gradient: "from-black via-black/80 to-black/30",
    muted: true,
    link: "/events/tot-samyj-bal",
    linkText: "Подробнее",
  },
];

export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.querySelector("[data-carousel-card]")?.clientWidth ?? 400;
      scrollRef.current.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
    }
  };

  return (
    <section id="events" className="py-20 md:py-28 px-6 md:px-12 overflow-hidden">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase mb-12 text-center"
      >
        Тусы
      </motion.h2>

      {/* Location filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center gap-3 mb-10 overflow-x-auto pb-2"
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm tracking-wider whitespace-nowrap">
          <MapPin size={14} /> Mriya
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 text-sm tracking-wider whitespace-nowrap hover:bg-white/10 transition-colors cursor-pointer">
          <MapPin size={14} /> Крым
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-white/70 text-sm tracking-wider whitespace-nowrap hover:bg-white/10 transition-colors cursor-pointer">
          <MapPin size={14} /> Ялта
        </span>
      </motion.div>

      {/* Carousel */}
      <div className="relative max-w-6xl mx-auto">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto overflow-y-hidden pb-4 -mx-4 px-4 md:px-12 scroll-smooth snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              id={event.type === "past" ? "past-events" : undefined}
              data-carousel-card
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="flex-shrink-0 w-[85vw] sm:w-[400px] md:w-[420px] snap-center"
            >
              <motion.div
                whileHover={{ y: -4 }}
                className="relative overflow-hidden group h-full"
              >
                <div className={`relative aspect-square bg-black ${event.muted ? "opacity-90" : ""}`}>
                  <Image
                    src={getOptimizedPhotoUrl(event.image)}
                    alt={event.title}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 640px) 85vw, (max-width: 768px) 400px, 420px"
                    className={`object-cover transition-all duration-500 ${event.muted ? "opacity-80 group-hover:opacity-90" : "group-hover:scale-[1.02]"}`}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${event.gradient}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                  <span
                    className={`absolute top-4 left-4 px-3 py-1 text-xs font-medium tracking-wider ${event.tagStyle}`}
                  >
                    {event.tag}
                  </span>
                  {event.type === "upcoming" && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur text-white text-xs tracking-wider">
                      Mriya
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <h3
                      className={`font-display text-2xl md:text-3xl font-bold tracking-wide mb-2 ${event.muted ? "text-white/95" : "text-white"}`}
                    >
                      {event.title}
                    </h3>
                    <div className={`flex flex-wrap gap-4 text-sm ${event.muted ? "text-white/70" : "text-white/80"}`}>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {event.location}
                      </span>
                    </div>
                    {event.price && (
                      <p className={`font-semibold mt-2 ${event.muted ? "text-white/50" : "text-[var(--accent)]"}`}>
                        {event.price}
                      </p>
                    )}
                    {(event.link || event.linkText) && (
                      <motion.a
                        href={event.link ?? "#"}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className={`mt-4 inline-flex items-center justify-center px-6 py-3 font-display text-sm font-semibold tracking-widest uppercase transition-colors ${
                          event.type === "upcoming"
                            ? "border-2 border-[var(--accent)] text-[var(--accent)] bg-transparent hover:bg-[var(--accent)]/15"
                            : "bg-white text-black hover:bg-white/90"
                        }`}
                      >
                        {event.linkText}
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Nav arrows - desktop */}
        <button
          onClick={() => scroll(-1)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Предыдущее"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-12 h-12 items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Следующее"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scroll hint - mobile */}
      <p className="text-center text-white/40 text-xs mt-6 md:hidden">
        Свайпните для просмотра
      </p>

      {/* All events button */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mt-12"
      >
        <motion.a
          href="#events"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-12 py-4 bg-white/10 backdrop-blur border border-white/20 text-white font-display text-sm tracking-[0.2em] uppercase hover:bg-white/20 transition-all duration-300"
        >
          Все тусы
        </motion.a>
      </motion.div>

    </section>
  );
}
