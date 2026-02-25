"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import TransitionLink from "./TransitionLink";

const pastEvents = [
  {
    id: "bal",
    title: "ТОТ САМЫЙ БАЛ",
    date: "1 ноября 2025",
    image: "/avisha/telegram-cloud-photo-size-2-5415889954678109345-y.jpg",
    link: "/events/tot-samyj-bal",
  },
];

export default function PastEventsSection() {
  return (
    <section id="past" className="py-14 md:py-20 px-6 md:px-12 bg-black/30 scroll-mt-20 flex flex-col items-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-2xl md:text-3xl font-bold uppercase mb-8 text-center"
      >
        Прошедшие мероприятия
      </motion.h2>

      <div className="max-w-4xl mx-auto flex justify-center">
        <div className="w-full max-w-[280px] md:max-w-[320px]">
        {pastEvents.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
          >
            <TransitionLink href={event.link} className="block overflow-hidden group rounded-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)]">
              {/* Картинка 1:1 */}
              <div className="relative aspect-square min-h-[200px] md:min-h-[240px] overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 896px"
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
              {/* Текст снизу на тёмном фоне */}
              <div className="bg-black px-6 py-5 md:px-7 md:py-6 -mt-1">
                <span className="inline-block px-3 py-1 bg-white/10 text-white/90 text-xs border border-white/20 mb-2">
                  Прошло
                </span>
                <h3 className="font-display text-xl md:text-2xl font-bold text-white">{event.title}</h3>
                <p className="text-white/80 text-sm mt-1">{event.date}</p>
                <span className="inline-block mt-2 text-[var(--accent)] text-sm font-medium uppercase">
                  Подробнее →
                </span>
              </div>
            </TransitionLink>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}
