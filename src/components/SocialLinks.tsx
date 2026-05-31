"use client";

import { Send } from "lucide-react";
import { SOCIAL } from "@/lib/social";
import VkIcon from "@/components/icons/VkIcon";

const iconLinkClass =
  "text-white/70 hover:text-[var(--accent)] transition-colors";

const textLinkClass =
  "inline-flex items-center gap-2 text-white/60 text-sm hover:text-[var(--accent)] transition-colors";

type SocialLinksProps = {
  /** header: только иконки; footer: иконка + подпись; menu: иконка + подпись крупнее */
  variant?: "header" | "footer" | "menu";
  className?: string;
};

export default function SocialLinks({ variant = "header", className = "" }: SocialLinksProps) {
  const gap = variant === "header" ? "gap-4" : "gap-6";
  const iconSize = variant === "header" ? 18 : 20;

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <a
        href={SOCIAL.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === "footer" ? textLinkClass : iconLinkClass}
        aria-label="Telegram"
      >
        <Send size={iconSize} className="shrink-0" />
        {variant !== "header" && "Telegram"}
      </a>
      <a
        href={SOCIAL.vk}
        target="_blank"
        rel="noopener noreferrer"
        className={variant === "footer" ? textLinkClass : iconLinkClass}
        aria-label="ВКонтакте"
      >
        <VkIcon size={iconSize} className="shrink-0" />
        {variant !== "header" && "ВКонтакте"}
      </a>
    </div>
  );
}
