"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PreloaderProps {
  isVisible: boolean;
  logo?: string;
}

export default function Preloader({ isVisible, logo = "/logo.png" }: PreloaderProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.12, 0.8, 0.24, 1] }}
            className="relative w-28 h-28 md:w-36 md:h-36"
          >
            <Image src={logo} alt="?КАКТУСА" fill sizes="144px" className="object-contain" priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
