"use client";

import { useState, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import Preloader from "./Preloader";
import Header from "./Header";
import HeroSection from "./HeroSection";
import EventsCarousel from "./EventsCarousel";
import AboutSection from "./AboutSection";
import GallerySection from "./GallerySection";
import ReviewsSection from "./ReviewsSection";
import Footer from "./Footer";
import type { MainContent } from "@/types/data";
import type { Event } from "@/types/data";

const PRELOADER_DONE_KEY = "kaktusa-preloader-done";
const MIN_PRELOADER_TIME = 800;
const MAX_WAIT_TIME = 4000; // Защита: принудительно показать контент, если видео так и не стартовало

interface PageWithPreloaderProps {
  main?: MainContent | null;
  events?: Event[] | null;
}

export default function PageWithPreloader({ main, events }: PageWithPreloaderProps) {
  const [skipPreloader, setSkipPreloader] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const isMobile = useIsMobile();

  const handleVideoLoaded = useCallback(() => setVideoLoaded(true), []);
  const handleVideoPlaying = useCallback(() => setVideoPlaying(true), []);

  const videoReady = isMobile ? videoPlaying : videoLoaded;
  const isReady = skipPreloader || (videoReady && minTimeReached) || timedOut;

  useEffect(() => {
    queueMicrotask(() => {
      const skip = !!sessionStorage.getItem(PRELOADER_DONE_KEY);
      setSkipPreloader(skip);
      if (skip) document.body.classList.add("preloader-done");
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      sessionStorage.setItem(PRELOADER_DONE_KEY, "1");
      document.body.classList.add("preloader-done");
    }
  }, [isReady]);

  useEffect(() => {
    if (skipPreloader) return;
    const t = setTimeout(() => setMinTimeReached(true), MIN_PRELOADER_TIME);
    return () => clearTimeout(t);
  }, [skipPreloader]);

  useEffect(() => {
    if (skipPreloader) return;
    const t = setTimeout(() => setTimedOut(true), MAX_WAIT_TIME);
    return () => clearTimeout(t);
  }, [skipPreloader]);

  useEffect(() => {
    if (!isReady) return;
    const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) return;
    const t = setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(t);
  }, [isReady]);

  return (
    <>
      <Preloader isVisible={!isReady} logo={main?.hero?.logoScrolled} />
      <main className="min-h-screen bg-[#0a0a0a]">
        <Header logoHero={main?.hero?.logoHero} logoScrolled={main?.hero?.logoScrolled} />
        <HeroSection hero={main?.hero} onVideoLoaded={handleVideoLoaded} onVideoPlaying={handleVideoPlaying} isReady={isReady} />
        <EventsCarousel events={events ?? undefined} />
        <AboutSection about={main?.about} logo={main?.hero?.logoScrolled} />
        <GallerySection photos={main?.gallery?.photos} />
        <ReviewsSection reviews={main?.reviews} />
        <Footer logo={main?.hero?.logoScrolled} />
      </main>
    </>
  );
}
