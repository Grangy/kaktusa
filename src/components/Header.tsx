"use client";

import { useState } from "react";
import TransitionLink from "./TransitionLink";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-8 md:py-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <TransitionLink href="/" className="font-display text-xl md:text-2xl font-semibold uppercase text-white hover:text-[var(--accent)] transition-colors duration-300">
          ?КАКТУСА
        </TransitionLink>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative w-10 h-10 flex flex-col justify-center items-center gap-1.5 group"
          aria-label="Меню"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-white"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-0.5 bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-0.5 bg-white"
          />
        </button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 pt-20"
            onClick={() => setMenuOpen(false)}
          >
            <TransitionLink
              href="/events/bloom-of-energy"
              className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Мероприятия
            </TransitionLink>
            <TransitionLink
              href="/#past"
              className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Прошедшие
            </TransitionLink>
            <TransitionLink
              href="/#about-us"
              className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Что такое ?КАКТУСА
            </TransitionLink>
            <TransitionLink
              href="/#gallery"
              className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Галерея
            </TransitionLink>
            <TransitionLink
              href="/#reviews"
              className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Отзывы
            </TransitionLink>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
