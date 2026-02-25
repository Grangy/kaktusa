"use client";

import { useRef, useEffect, useState } from "react";
import TransitionLink from "./TransitionLink";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const DEFAULT_TITLE_TOP = "BLOOM";
const DEFAULT_TITLE_BOTTOM = "OF ENERGY";
const DEFAULT_PC_IMAGES = ["/pc/IMG_9884.JPG", "/pc/IMG_9881.JPG"];
const SWITCH_INTERVAL = 20000;
const DEFAULT_VIDEO_FULL = "/intro.mp4";
const DEFAULT_VIDEO_LITE = "/intro-lite.mp4";

function getVideoSrc(full: string, lite: string): string {
  if (typeof navigator === "undefined") return full;
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }).connection;
  if (conn?.saveData) return lite;
  if (conn?.effectiveType === "2g" || conn?.effectiveType === "slow-2g") return lite;
  return full;
}

interface HeroSectionProps {
  hero?: {
    titleTop: string;
    titleBottom: string;
    heroDate: string;
    heroVenue: string;
    heroVenueEn: string;
    pcImages: string[];
    videoFull: string;
    videoLite: string;
  } | null;
  onVideoLoaded?: () => void;
  isReady?: boolean;
}

export default function HeroSection({ hero, onVideoLoaded, isReady }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFull = hero?.videoFull ?? DEFAULT_VIDEO_FULL;
  const videoLite = hero?.videoLite ?? DEFAULT_VIDEO_LITE;
  const [videoSrc] = useState(() => getVideoSrc(videoFull, videoLite));
  const pcImages = hero?.pcImages?.length ? hero.pcImages : DEFAULT_PC_IMAGES;
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
    const t = setInterval(() => setPcImageIndex((i) => (i + 1) % pcImages.length), SWITCH_INTERVAL);
    return () => clearInterval(t);
  }, [pcImages.length]);

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
          {pcImages.map((src, i) => (
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
        {isReady && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 6, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold uppercase text-center text-white mb-6"
          >
            <div className="text-5xl md:text-7xl lg:text-8xl leading-tight tracking-wide">
              {hero?.titleTop ?? DEFAULT_TITLE_TOP}
            </div>
            <div className="text-3xl md:text-5xl lg:text-6xl mt-1 md:mt-2 tracking-widest text-white/95">
              {hero?.titleBottom ?? DEFAULT_TITLE_BOTTOM}
            </div>
          </motion.div>
        )}
        {isReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-white/90 text-center text-base md:text-lg mb-10 space-y-1"
          >
            <p className="font-semibold">{hero?.heroDate ?? "28 марта 2026"}</p>
            <p className="text-white/80">{hero?.heroVenue ?? "Отель Мрия"}</p>
            <p className="text-white/70 text-sm md:text-base">{hero?.heroVenueEn ?? "Night club Foster"}</p>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isReady ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <TransitionLink
            href="/events/bloom-of-energy#tickets"
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
