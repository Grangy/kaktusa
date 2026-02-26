"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Camera } from "lucide-react";
import Image from "next/image";

const SCROLL_THRESHOLD = 20; // как только скролл начался
const LOGO_SWITCH_DURATION = 1; // плавная смена

const DEFAULT_LOGO_HERO = "/new-logo.png";
const DEFAULT_LOGO_SCROLLED = "/logo.png";

const MENU_ITEMS: { label: string; path: string }[] = [
  { label: "Главная", path: "/" },
  { label: "Мероприятия", path: "/events/bloom-of-energy" },
  { label: "Прошедшие мероприятия", path: "/#past" },
  { label: "О нас", path: "/#about-us" },
  { label: "Галерея", path: "/#gallery" },
  { label: "Отзывы", path: "/#reviews" },
];

interface HeaderProps {
  logoHero?: string;
  logoScrolled?: string;
}

export default function Header({ logoHero = DEFAULT_LOGO_HERO, logoScrolled = DEFAULT_LOGO_SCROLLED }: HeaderProps = {}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMinimal, setShowMinimal] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === "/";
  useEffect(() => {
    if (!isHome) {
      setShowMinimal(true);
      return;
    }
    const check = () => setShowMinimal(window.scrollY > SCROLL_THRESHOLD);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [isHome]);

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
        className="flex items-center justify-between h-12 md:h-14"
      >
        <TransitionLink href="/" className="flex items-center h-full">
          <div className="h-full w-32 md:w-40 relative shrink-0">
            <div className="absolute inset-0">
              <motion.div
                animate={{ opacity: showMinimal ? 0 : 1 }}
                transition={{ duration: LOGO_SWITCH_DURATION }}
                className="absolute inset-0"
                aria-hidden={showMinimal}
              >
                <Image src={logoHero} alt="?КАКТУСА" fill className="object-contain object-left" sizes="144px" priority />
              </motion.div>
              <motion.div
                animate={{ opacity: showMinimal ? 1 : 0 }}
                transition={{ duration: LOGO_SWITCH_DURATION }}
                className="absolute inset-0"
                aria-hidden={!showMinimal}
              >
                <Image src={logoScrolled} alt="?КАКТУСА" fill className="object-contain object-left" sizes="160px" />
              </motion.div>
            </div>
          </div>
        </TransitionLink>

        <div className="flex items-center gap-4">
          {/* Desktop: соцсети справа */}
          <div className="hidden md:flex items-center gap-4">
            <a href="https://t.me/kaktusa_project" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[var(--accent)] transition-colors" aria-label="Telegram">
              <Send size={18} />
            </a>
            <a href="https://www.instagram.com/kaktusa.project" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[var(--accent)] transition-colors" aria-label="Instagram">
              <Camera size={18} />
            </a>
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
        </div>
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
            {/* Mobile: соцсети под меню */}
            <div className="flex md:hidden gap-6 pt-4">
              <a href="https://t.me/kaktusa_project" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-[var(--accent)] transition-colors">
                <Send size={20} /> Telegram
              </a>
              <a href="https://www.instagram.com/kaktusa.project" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white/70 hover:text-[var(--accent)] transition-colors">
                <Camera size={20} /> Instagram
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
