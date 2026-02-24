"use client";

import { useState, useCallback, useEffect } from "react";
import Preloader from "./Preloader";
import Header from "./Header";
import HeroSection from "./HeroSection";
import EventsCarousel from "./EventsCarousel";
import AboutSection from "./AboutSection";
import GallerySection from "./GallerySection";
import ReviewsSection from "./ReviewsSection";
import Footer from "./Footer";

const PRELOADER_DONE_KEY = "kaktusa-preloader-done";
const MIN_PRELOADER_TIME = 800;
const MAX_WAIT_TIME = 4000; // Защита: принудительно показать контент, если видео не загрузилось

export default function PageWithPreloader() {
  const [skipPreloader, setSkipPreloader] = useState(false);
  const [minTimeReached, setMinTimeReached] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const handleVideoLoaded = useCallback(() => {
    setVideoLoaded(true);
  }, []);

  const isReady = skipPreloader || (videoLoaded && minTimeReached) || timedOut;

  useEffect(() => {
    queueMicrotask(() => {
      setSkipPreloader(!!sessionStorage.getItem(PRELOADER_DONE_KEY));
    });
  }, []);

  useEffect(() => {
    if (isReady) {
      sessionStorage.setItem(PRELOADER_DONE_KEY, "1");
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

  return (
    <>
      <Preloader isVisible={!isReady} />
      <main className="min-h-screen">
        <Header />
        <HeroSection onVideoLoaded={handleVideoLoaded} isReady={isReady} />
        <EventsCarousel />
        <AboutSection />
        <GallerySection />
        <ReviewsSection />
        <Footer />
      </main>
    </>
  );
}
