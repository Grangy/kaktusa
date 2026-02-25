"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface PreloaderProps {
  isVisible: boolean;
}

export default function Preloader({ isVisible }: PreloaderProps) {
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
            initial={false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative w-28 h-28 md:w-36 md:h-36 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="relative w-full h-full"
            >
              <Image
                src="/logo.png"
                alt="?КАКТУСА"
                fill
                sizes="144px"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
