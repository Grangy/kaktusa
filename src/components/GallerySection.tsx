"use client";

import { motion } from "framer-motion";

const galleryItems = [
  { id: 1, gradient: "from-emerald-900 to-emerald-950", aspect: "aspect-square" },
  { id: 2, gradient: "from-amber-900/50 to-black", aspect: "aspect-[3/4]" },
  { id: 3, gradient: "from-purple-900/50 to-black", aspect: "aspect-square" },
  { id: 4, gradient: "from-rose-900/30 to-black", aspect: "aspect-[4/3]" },
  { id: 5, gradient: "from-teal-900/50 to-black", aspect: "aspect-square" },
  { id: 6, gradient: "from-emerald-800/50 to-black", aspect: "aspect-[3/4]" },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="py-14 md:py-20 px-6 md:px-12 overflow-hidden scroll-mt-20">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-display text-3xl md:text-4xl font-bold uppercase mb-10 text-center"
      >
        Галерея
      </motion.h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
        {galleryItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ scale: 1.02, zIndex: 10 }}
            className={`relative overflow-hidden rounded-none bg-gradient-to-br ${item.gradient} ${item.aspect} border border-white/5 cursor-pointer group transition-transform duration-300`}
          >
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-opacity group-hover:opacity-100">
                ?КАКТУСА
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
