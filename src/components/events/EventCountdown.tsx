"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const TARGET = new Date("2025-03-28T22:00:00+03:00");

function getTimeLeft() {
  const now = new Date();
  const diff = TARGET.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => {
      cancelAnimationFrame(id);
      clearInterval(timer);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-xl mx-auto">
        {["Дней", "Часов", "Минут", "Секунд"].map((label) => (
          <div key={label} className="text-center">
            <div className="font-display text-2xl md:text-4xl font-bold text-white mb-1 h-12 bg-white/10 animate-pulse" />
            <span className="text-white/50 text-xs tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Дней" },
    { value: timeLeft.hours, label: "Часов" },
    { value: timeLeft.minutes, label: "Минут" },
    { value: timeLeft.seconds, label: "Секунд" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-xl mx-auto">
      {units.map(({ value, label }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="text-center"
        >
          <div className="font-display text-2xl md:text-4xl font-bold text-white mb-1 tabular-nums">
            {String(value).padStart(2, "0")}
          </div>
          <span className="text-white/50 text-xs tracking-widest">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
