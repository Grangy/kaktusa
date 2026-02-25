"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const MENU_ITEMS: { label: string; path: string }[] = [
  { label: "Мероприятия", path: "/events/bloom-of-energy" },
  { label: "Прошедшие", path: "/#past" },
  { label: "Что такое ?КАКТУСА", path: "/#about-us" },
  { label: "Галерея", path: "/#gallery" },
  { label: "Отзывы", path: "/#reviews" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuLink = (path: string) => {
    setMenuOpen(false);
    if (path.startsWith("/#")) {
      const [, hash] = path.split("#");
      if (pathname !== "/") {
        router.push(path);
      } else if (hash) {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(path);
    }
  };

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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white hover:text-[var(--accent)] transition-colors"
              aria-label="Закрыть меню"
            >
              <X size={28} strokeWidth={2} />
            </button>
            {MENU_ITEMS.map(({ label, path }) => (
              <button
                key={path}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMenuLink(path);
                }}
                className="font-display text-2xl md:text-4xl tracking-wide text-white hover:text-[var(--accent)] transition-colors text-left"
              >
                {label}
              </button>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
