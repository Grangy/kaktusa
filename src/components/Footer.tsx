"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { motion } from "framer-motion";

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navPrefix = isHome ? "" : "/";

  return (
    <footer className="border-t border-white/10 pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <TransitionLink href="/" className="font-display text-3xl font-bold uppercase text-white hover:text-[var(--accent)] transition-colors inline-block mb-4">
              ?КАКТУСА
            </TransitionLink>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              ?КАКТУСА — электронные ивенты с особым смыслом и звучанием в уникальных локациях Крыма.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-4">
              Навигация
            </h4>
            <nav className="space-y-2">
              <TransitionLink href={`${navPrefix}#upcoming`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Мероприятия</TransitionLink>
              <TransitionLink href={`${navPrefix}#past`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Прошедшие</TransitionLink>
              <TransitionLink href={`${navPrefix}#about-us`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Что такое ?КАКТУСА</TransitionLink>
              <TransitionLink href={`${navPrefix}#gallery`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Галерея</TransitionLink>
              <TransitionLink href={`${navPrefix}#reviews`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Отзывы</TransitionLink>
            </nav>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-4">
              Контакты
            </h4>
            <p className="text-white/60 text-sm">kaktusa.ru</p>
            <p className="text-white/60 text-sm mt-1">Билеты у организаторов</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10"
        >
          <p className="text-white/40 text-xs tracking-wider">
            © 2025 ?КАКТУСА. Все права защищены.
          </p>
          <p className="text-white/40 text-xs">
            FC/DC 18+
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
