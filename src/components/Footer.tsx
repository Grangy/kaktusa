"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "./TransitionLink";
import { motion } from "framer-motion";
import Image from "next/image";
import SocialLinks from "./SocialLinks";
import { useLogo } from "@/contexts/LogoContext";
import { LEGAL_PATHS } from "@/lib/legal";
import { OperatorRequisites } from "@/components/legal/OperatorRequisites";

interface FooterProps {
  logo?: string;
}

export default function Footer({ logo: logoProp }: FooterProps = {}) {
  const { logoScrolled } = useLogo();
  const logo = logoProp ?? logoScrolled;
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navPrefix = isHome ? "" : "/";

  return (
    <footer className="border-t border-white/10 pt-12 pb-8 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <TransitionLink href="/" className="inline-flex items-center gap-3 mb-4 group">
              <span className="relative block w-10 h-10 shrink-0">
                <Image src={logo} alt="" fill className="object-contain transition-transform duration-200 group-hover:scale-105" sizes="40px" />
              </span>
              <span className="font-display text-3xl font-bold uppercase text-white group-hover:text-[var(--accent)] transition-colors">
                ?КАКТУСА
              </span>
            </TransitionLink>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              ?КАКТУСА — электронные ивенты с особым смыслом и звучанием в уникальных локациях Крыма.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-4">
              Навигация
            </h4>
            <nav className="space-y-2">
              <TransitionLink href={`${navPrefix}#upcoming`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Мероприятия</TransitionLink>
              <TransitionLink href={`${navPrefix}#past`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Прошедшие</TransitionLink>
              <TransitionLink href={`${navPrefix}#about-us`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">О нас</TransitionLink>
              <TransitionLink href={`${navPrefix}#gallery`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Галерея</TransitionLink>
              <TransitionLink href={`${navPrefix}#reviews`} className="block py-1.5 text-white/60 text-sm hover:text-[var(--accent)] transition-colors focus:text-[var(--accent)] focus:outline-none">Отзывы</TransitionLink>
            </nav>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-4">
              Реквизиты
            </h4>
            <OperatorRequisites />
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-3 mt-6">
              Документы
            </h4>
            <nav className="space-y-2 mb-6">
              <TransitionLink href={LEGAL_PATHS.privacy} className="block py-1 text-white/60 text-sm hover:text-[var(--accent)] transition-colors">
                Политика конфиденциальности
              </TransitionLink>
              <TransitionLink href={LEGAL_PATHS.terms} className="block py-1 text-white/60 text-sm hover:text-[var(--accent)] transition-colors">
                Пользовательское соглашение
              </TransitionLink>
            </nav>
            <h4 className="font-display text-sm font-semibold tracking-wide text-white/80 uppercase mb-3">
              Соцсети
            </h4>
            <SocialLinks variant="footer" className="flex-col items-start gap-3" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-8 border-t border-white/10"
        >
          <p className="text-white/40 text-xs tracking-wider text-center md:text-left">
            © {new Date().getFullYear()} ?КАКТУСА. Все права защищены.
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1 text-white/40 text-xs">
            <TransitionLink href={LEGAL_PATHS.privacy} className="hover:text-[var(--accent)] transition-colors">
              Конфиденциальность
            </TransitionLink>
            <TransitionLink href={LEGAL_PATHS.terms} className="hover:text-[var(--accent)] transition-colors">
              Соглашение
            </TransitionLink>
            <span className="shrink-0">FC/DC 18+</span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
