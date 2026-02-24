"use client";

import { useRef, useEffect, useState } from "react";
import TransitionLink from "./TransitionLink";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const TITLE = "BLOOM OF ENERGY";
const PC_IMAGES = ["/pc/IMG_9884.JPG", "/pc/IMG_9881.JPG"];
const SWITCH_INTERVAL = 20000;
const VIDEO_FULL = "/intro.mp4";
const VIDEO_LITE = "/intro-lite.mp4";

function getVideoSrc(): string {
  if (typeof navigator === "undefined") return VIDEO_FULL;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn?.saveData) return VIDEO_LITE;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return VIDEO_LITE;
  return VIDEO_FULL;
}

interface HeroSectionProps {
  onVideoLoaded?: () => void;
  isReady?: boolean;
}

export default function HeroSection({ onVideoLoaded, isReady }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc] = useState(() => getVideoSrc());
  const [typedText, setTypedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [pcImageIndex, setPcImageIndex] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    // На десктопе видео скрыто (md:hidden) — сразу считаем загруженным
    if (!video) {
      onVideoLoaded?.();
      return;
    }
    const handleLoaded = () => onVideoLoaded?.();
    if (video.readyState >= 4) {
      handleLoaded();
    } else {
      video.addEventListener("canplaythrough", handleLoaded, { once: true });
      video.addEventListener("canplay", handleLoaded, { once: true });
      video.addEventListener("error", handleLoaded, { once: true });
      return () => {
        video.removeEventListener("canplaythrough", handleLoaded);
        video.removeEventListener("canplay", handleLoaded);
        video.removeEventListener("error", handleLoaded);
      };
    }
  }, [onVideoLoaded]);

  useEffect(() => {
    if (!isReady) return;
    const video = videoRef.current;
    if (video) {
      video.currentTime = 15;
      video.play().catch(() => {});
    }
  }, [isReady]);

  useEffect(() => {
    if (!isReady) return;
    let i = 0;
    const type = () => {
      if (i <= TITLE.length) {
        setTypedText(TITLE.slice(0, i));
        i++;
        setTimeout(type, 100);
      } else {
        setShowCursor(false);
      }
    };
    const t = setTimeout(type, 0);
    return () => clearTimeout(t);
  }, [isReady]);

  useEffect(() => {
    const t = setInterval(() => setPcImageIndex((i) => (i + 1) % PC_IMAGES.length), SWITCH_INTERVAL);
    return () => clearInterval(t);
  }, []);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 0.4, 1], [0, 120, 320]);
  const yVideo = useTransform(scrollYProgress, [0, 0.25, 0.6, 1], [0, 180, 380, 520]);

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col justify-between overflow-hidden">
      {/* Фон: видео с усиленным параллаксом (все устройства) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y: yVideo }} className="absolute inset-0 -top-[30%] -bottom-[30%] scale-110">
          <video
            ref={videoRef}
            src={videoSrc}
            poster="/intro-poster.jpg"
            playsInline
            muted
            loop
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90 pointer-events-none" />
      </div>

      {/* Desktop: поверх видео — два фото по очереди (доп. слой) */}
      <div className="absolute inset-0 hidden md:block overflow-hidden pointer-events-none">
        <motion.div style={{ y }} className="absolute inset-0 -top-[25%] -bottom-[25%]">
          <div className="absolute inset-0">
            <Image src="/avisha/IMG_2657.PNG" alt="" fill className="object-cover" priority sizes="100vw" />
          </div>
          {PC_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === pcImageIndex ? "opacity-100" : "opacity-0"}`}
            >
              <Image src={src} alt="" fill className="object-cover" priority={i === 0} sizes="100vw" loading={i === 0 ? undefined : "lazy"} unoptimized />
            </div>
          ))}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/90 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase text-center text-white mb-2"
        >
          {typedText}
          {showCursor && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block w-1 md:w-1.5 h-[0.85em] bg-white align-middle ml-0.5 md:ml-1"
            />
          )}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-white/60 text-sm md:text-base uppercase mb-4"
        >
          Mriya
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="text-white/90 text-lg md:text-xl mb-10"
        >
          Где энергия встречает весну
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <TransitionLink
            href="/events/bloom-of-energy"
            prefetch
            className="inline-block px-10 py-4 border-2 border-[var(--accent)] font-display text-sm uppercase text-white hover:bg-[var(--accent)]/20 transition-all duration-300 animate-glow-pulse"
          >
            Купить билет
          </TransitionLink>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-white/50 flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white/80" />
        </motion.div>
      </motion.div>
    </section>
  );
}
