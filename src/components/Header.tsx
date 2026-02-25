"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";

const MENU_ITEMS: { label: string; path: string }[] = [
  { label: "Главная", path: "/" },
  { label: "Мероприятия", path: "/events/bloom-of-energy" },
  { label: "Прошедшие", path: "/#past" },
  { label: "Что такое ?КАКТУСА", path: "/#about-us" },
  { label: "Галерея", path: "/#gallery" },
  { label: "Отзывы", path: "/#reviews" },
];

const SCROLL_THRESHOLD = 800;
const SCROLL_PER_ROTATION = 2000;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { scrollY } = useScroll();
  const smoothstep = (t: number) => t * t * (3 - 2 * t);
  const textOpacity = useTransform(scrollY, (v) => {
    const t = Math.max(0, Math.min(1, v / SCROLL_THRESHOLD));
    return 1 - smoothstep(t);
  });
  const logoOpacity = useTransform(scrollY, (v) => {
    const t = Math.max(0, Math.min(1, v / SCROLL_THRESHOLD));
    return smoothstep(t);
  });
  const logoRotate = useTransform(scrollY, (v) =>
    v > SCROLL_THRESHOLD ? ((v - SCROLL_THRESHOLD) / SCROLL_PER_ROTATION) * 360 : 0
  );

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
        className="flex items-center justify-between h-10 md:h-12"
      >
        <div className="relative flex items-center justify-start h-full flex-shrink-0 min-w-[2.5rem] md:min-w-[3rem]">
          <span className="invisible font-display text-xl md:text-2xl font-semibold uppercase whitespace-nowrap pointer-events-none" aria-hidden>
            ?КАКТУСА
          </span>
          <TransitionLink
            href="/"
            className="absolute left-0 top-0 bottom-0 flex items-center z-10 font-display text-xl md:text-2xl font-semibold uppercase text-white hover:text-[var(--accent)] transition-colors duration-300"
          >
            <motion.span style={{ opacity: textOpacity }} className="whitespace-nowrap">
              ?КАКТУСА
            </motion.span>
          </TransitionLink>
          <motion.div
            style={{ opacity: logoOpacity }}
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-start"
          >
            <motion.div style={{ rotate: logoRotate }} className="h-full aspect-square relative origin-center shrink-0">
              <Image src="/logo.png" alt="?КАКТУСА" fill className="object-contain" sizes="48px" />
            </motion.div>
          </motion.div>
        </div>

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
