"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Calendar, Clock, Ticket, Gift, Users } from "lucide-react";
import type { Event } from "@/types/data";

const DEFAULT_ARTISTS = ["GRETTA", "SANSÁRIAN", "WILYAMDELOVE & NOBE (Bassmatic Records)", "RESONANCE", "KVITASH"];
const DEFAULT_TICKETS = [
  { id: "ga", name: "General Admission", price: "3 000 ₽", earlyBird: true },
];

const EVENT_CONTAINER = "max-w-4xl w-full mx-auto";

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function parseEventDate(dateStr: string, timeStr?: string): Date {
  if (!dateStr) return new Date("2026-03-28T22:00:00");
  const time = timeStr?.trim() || "22:00";
  const [h, m] = time.split(":").map(Number);
  const d = new Date(dateStr);
  d.setHours(isNaN(h) ? 22 : h, isNaN(m) ? 0 : m, 0, 0);
  return d;
}

export default function EventLanding({ event }: { event?: Event | null }) {
  const eventDate = event ? parseEventDate(event.date, event.time) : new Date("2026-03-28T22:00:00");
  const { days, hours, minutes, seconds } = useCountdown(eventDate);
  const heroRef = useRef<HTMLElement>(null);
  const title = event?.title ?? "BLOOM OF ENERGY";
  const heroImage = event?.heroImage || "/avisha/IMG_2657.PNG";
  const dateDisplay = event?.dateDisplay ?? "28 марта 2026";
  const timeDisplay = event?.time ?? "22:00";
  const locationShort = event?.locationShort ?? event?.location ?? "Foster Night Club";
  const venueTitle = event?.venueTitle ?? "Foster Night Club";
  const venueAddress = event?.venueAddress ?? "Mriya Resort";
  const venueCity = event?.venueCity ?? "Крым, Россия";
  const price = event?.price ?? "От 3 000 ₽";
  const artists = event?.artists?.length ? event.artists : DEFAULT_ARTISTS;
  const allTickets = event?.tickets?.length ? event.tickets : DEFAULT_TICKETS;
  const tickets = allTickets.filter((t) => t.id !== "promo" && !t.name?.includes("4 билета + 1"));
  const aboutParagraphs = event?.aboutParagraphs?.filter(Boolean).length
    ? event.aboutParagraphs.filter(Boolean)
    : [
        "Приглашаем Вас на BLOOM OF ENERGY — вечер, где каждый ощутит внутренний рассвет весенней энергии в изысканной атмосфере.",
        "Специально для Вас мы везем WILYAMDELOVE & NOBE — творческий тандем, основатели лейбла Bassmatic Records, релизы которого регулярно попадают в топ мировых площадок.",
      ];
  const buyTicketUrl = event?.buyTicketUrl ?? "https://llava.ru/e/73a93efa2e7b750ff16a2cedc1c69c56";
  const age = event?.age ?? "18+";
  const dressCode = event?.dressCode ?? "Яркие оттенки в образе и макияже, необычные фактуры";
  const rules = event?.rules ?? "Уважайте площадку и других гостей";
  const heroTagline = event?.heroTagline?.trim();
  const heroTitleTop = event?.heroTitleTop?.trim();
  const heroTitleBottom = event?.heroTitleBottom?.trim();
  const titleSplit = !!(heroTitleTop || heroTitleBottom);
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
              src={heroImage}
              alt={title}
              fill
              className="object-cover object-top opacity-50"
              priority
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(0,0,0,0.85),rgba(0,0,0,0.4)_60%,transparent_85%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_15%,rgba(0,0,0,0.5)_35%,rgba(0,0,0,0.5)_65%,transparent_85%)]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1 mb-6 rounded-full bg-purple-500/90 text-white text-xs font-semibold tracking-wide uppercase"
          >
            Special Event
          </motion.span>
          {titleSplit ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-bold uppercase text-center mb-4"
            >
              <div className="text-5xl md:text-7xl lg:text-8xl leading-tight tracking-wide">
                {heroTitleTop || title}
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl mt-1 md:mt-2 tracking-widest text-white/95">
                {heroTitleBottom || ""}
              </div>
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl font-bold  uppercase mb-4"
            >
              {title}
            </motion.h1>
          )}
          {heroTagline ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-sm md:text-base uppercase mb-12 prose prose-invert prose-p:my-1 prose-strong:text-white prose-em:text-white/90 max-w-none"
              dangerouslySetInnerHTML={{ __html: heroTagline }}
            />
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/70 text-sm  uppercase mb-12"
            >
              До начала осталось
            </motion.p>
          )}

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-4 gap-4 md:gap-8 mb-12 max-w-md mx-auto"
          >
            {[
              { value: days, label: "Дней" },
              { value: hours, label: "Часов" },
              { value: minutes, label: "Мин" },
              { value: seconds, label: "Сек" },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 rounded-2xl border border-white/10 bg-white/[0.03]">
                <div className="text-3xl md:text-4xl font-display font-bold tabular-nums text-[var(--accent)]">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-xs tracking-wide text-white/60 mt-1">{item.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.a
            href="#tickets"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block px-10 py-4 rounded-xl border-2 border-[var(--accent)] font-display text-sm uppercase text-white hover:bg-[var(--accent)]/20 transition-all backdrop-blur-sm"
          >
            Купить билет
          </motion.a>
        </div>
      </section>

      {/* When & Location & Price */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-t border-white/10">
        <div className={`${EVENT_CONTAINER} grid md:grid-cols-3 gap-6`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center md:text-left p-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-4">Когда</h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <Calendar size={18} />
              <span>{dateDisplay}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white/80 mt-2">
              <Clock size={18} />
              <span>{timeDisplay}</span>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center md:text-left p-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-4">Локация</h3>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white">
              <MapPin size={18} />
              <span>{locationShort}</span>
            </div>
            <p className="text-white/70 text-sm mt-2">{venueAddress}{venueCity ? `, ${venueCity}` : ""}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center md:text-left p-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]"
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-4">Цена</h3>
            <p className="text-[var(--accent)] font-semibold">{price}</p>
            {event?.priceNote && <p className="text-white/50 text-sm mt-1">{event.priceNote}</p>}
          </motion.div>
        </div>
      </section>

      {/* Event Details */}
      <section id="about-event" className="py-16 md:py-24 px-6 md:px-12 scroll-mt-20">
        <div className={`${EVENT_CONTAINER} p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]`}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold  uppercase mb-8"
          >
            О мероприятии
          </motion.h2>
          {aboutParagraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={i === 0 ? "text-white/90 text-lg leading-relaxed mb-8" : "text-white/60 text-sm mb-10"}
            >
              {p}
            </motion.p>
          ))}
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
        <div className={`${EVENT_CONTAINER} p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]`}>
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
            <h4 className="font-display text-lg tracking-wide">{venueTitle}</h4>
            <p className="text-white/70">{venueAddress}</p>
            <p className="text-white/50 text-sm">{venueCity}</p>
          </motion.div>
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="py-16 md:py-24 px-6 md:px-12">
        <div className={EVENT_CONTAINER}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-2xl md:text-3xl font-bold  uppercase mb-4"
          >
            Выберите билет
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white/60 text-sm mb-4"
          >
            Выберите тип билета
          </motion.p>
          <motion.a
            href="#about-event"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-sm text-white/70 hover:text-[var(--accent)] transition-colors underline underline-offset-2 mb-10"
          >
            О мероприятии
          </motion.a>
          <div className="space-y-4">
            {tickets.map((ticket, i) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-lg tracking-wide">{ticket.name}</h4>
                    {ticket.earlyBird && (
                      <span className="px-2 py-0.5 text-xs bg-[var(--accent)]/20 text-[var(--accent)]">Early Bird</span>
                    )}
                  </div>
                  <p className="text-[var(--accent)] font-semibold mt-1">
                    От {ticket.price.replace(/^От\s?/, "")}
                  </p>
                </div>
                <a
                  href={buyTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-display text-sm font-semibold tracking-wide uppercase hover:bg-white/90 transition-colors shrink-0"
                >
                  <Ticket size={16} /> Купить билет
                </a>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 p-6 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 flex items-start gap-3 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)]"
          >
            <Gift size={20} className="shrink-0 text-[var(--accent)]" />
            <div>
              <p className="font-medium text-white">Акция 4+1: детали уточняйте у организаторов</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Info */}
      <section className="py-16 md:py-24 px-6 md:px-12 border-t border-white/10">
        <div className={`${EVENT_CONTAINER} p-8 md:p-10 rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)] space-y-8`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-2">Возраст</h3>
            <p className="flex items-center gap-2 text-white">
              <Users size={18} /> {age}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-2">Дресс-код</h3>
            <p className="text-white/80 italic">{dressCode}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xs  uppercase text-white/50 mb-2">Правила</h3>
            <p className="text-white/80">{rules}</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
